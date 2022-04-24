import torch
from torch import nn
from torch.nn import functional
import pytorch_lightning as pl
import torchvision.models as models
import sklearn.metrics
import numpy as np


class MyModel(pl.LightningModule):

    def __init__(self, input_shape, num_classes=1, optimizer=None, lr=None, *args, **kwargs):
        """
        Creates a model consisting of
        - a Sequence of blocks
        layer_widths: []
            [input_dim, *hidden_layer_dims, n_classes]
       activation=method
            nn.ReLU, ...
        """
        super().__init__()
        if optimizer is None:
            optimizer = torch.optim.Adam
        self.optimizer = optimizer
        self.lr = lr
        self.feature_extractor = models.mobilenet_v2(pretrained=True)
        # layers are frozen by using eval()
        self.feature_extractor.eval()
        # freeze params
        for param in self.feature_extractor.parameters():
            param.requires_grad = False
        
        n_sizes = self._get_conv_output(input_shape)

        self.classifier = nn.Linear(n_sizes, num_classes)
        self.model = nn.Sequential(self.feature_extractor, self.classifier, nn.Sigmoid())

    def forward(self, x):
        return self.model(x)

    def _calculate_loss(self, x, y):
        """
        Calculation of loss-function used in training, validation, testing etc.
        """
        y_predicted = self(x)
        pos_class_weight = (1-sum(y)/len(y))
        weights = torch.full_like(y, 1-pos_class_weight)
        weights[torch.where(y)] = pos_class_weight
        loss = nn.BCELoss(weight=weights)(y_predicted.reshape(-1), y)
        return loss

    def training_step(self, batch, batch_idx):
        """
        Customize the training-procedure and the loss function.
        """
        x, y = batch
        x = x.to(torch.float32)
        y = y.to(torch.float32)
        y_predicted = self(x)
        loss = self._calculate_loss(x, y)
        #acc = sklearn.metrics.balanced_accuracy_score(y.cpu().detach().numpy(), 
        #np.round(y_predicted.cpu().detach().numpy()))
        return {'loss': loss} # , 'acc': acc}

    def validation_step(self, batch, batch_idx):
        x, y = batch
        x = x.to(torch.float32)
        y = y.to(torch.float32)
        y_predicted = self(x)
        loss = self._calculate_loss(x, y)
        acc = sklearn.metrics.balanced_accuracy_score(y.cpu(), torch.round(y_predicted.cpu()))
        print(loss, acc)
        metrics = {'val_loss': loss, 'val_acc': acc}
        self.log_dict(metrics)
        return metrics

    def test_step(self, batch, batch_idx):
        x, y = batch
        x = x.to(torch.float32)
        y = y.to(torch.float32)
        y_predicted = self(x)
        loss = self._calculate_loss(x, y)
        acc = sklearn.metrics.balanced_accuracy_score(y.cpu(), torch.round(y_predicted.cpu()))
        mtx = sklearn.metrics.confusion_matrix(y.cpu(), torch.round(y_predicted.cpu()))
        print(mtx)
        print(mtx[0,0]/sum(mtx[0]))
        print(mtx[1,1]/sum(mtx[1]))
        metrics = {'test_loss': loss, 'test_acc': acc}
        self.log_dict(metrics)
        return metrics

    def predict_step(self, batch, batch_idx, dataloader_idx=0):
        x, y = batch
        x = x.to(torch.float32)
        y = y.to(torch.float32)
        y_predicted = self(x)
        return y_predicted

    def configure_optimizers(self):
        """
        Configure optimizer to use.
        """
        return self.optimizer(self.parameters(), self.lr)

    def _get_conv_output(self, shape):
        batch_size = 1
        tmp_input = torch.autograd.Variable(torch.rand(batch_size, *shape))
        
        output_feat = self.feature_extractor(tmp_input)
        n_size = output_feat.data.view(batch_size, -1).size(1)
        return n_size