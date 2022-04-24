"""SegmentationNN"""
import torch
import torch.nn as nn
import pytorch_lightning as pl
from torchvision import models
from torch.nn import ConvTranspose2d
from torch.nn import Conv2d
from torch.nn import MaxPool2d
from torch.nn import Module
from torch.nn import ModuleList
from torch.nn import ReLU
from torchvision.transforms import CenterCrop
from torch.nn import functional as F
import torch

def init_weights(m):
    if isinstance(m, nn.Linear):
        torch.nn.init.xavier_uniform_(m.weight)
        m.bias.data.fill_(0.01)
        
def set_parameter_requires_grad(model, feature_extracting=False):
    # False when we are feature extracting
    
    return model
class SegmentationNN(pl.LightningModule):

    def __init__(self, num_classes=2, hparams=None):
        super(SegmentationNN, self).__init__()
        
        #######################################################################
        #                             YOUR CODE                               #
        #######################################################################

        self.model_encoder = self.initialize_encoder_model()
        
        # Alexnet
        # self.model_decoder = nn.Sequential(
        #     nn.ConvTranspose2d(256, 128, 4, stride=2, bias=False),
        #     nn.BatchNorm2d(128),
        #     nn.ReLU(inplace=True),
        #     nn.ConvTranspose2d(128, 64, 4, stride=2, bias=False),
        #     nn.BatchNorm2d(64),
        #     nn.ReLU(inplace=True),
        #     nn.ConvTranspose2d(64, 32, 4, stride=2, padding=1, bias=False),
        #     nn.BatchNorm2d(32),
        #     nn.ReLU(inplace=True),
        #     nn.ConvTranspose2d(32, 16, 4, stride=2, padding=1, bias=False),
        #     nn.BatchNorm2d(16),
        #     nn.ReLU(inplace=True),
        #     nn.ConvTranspose2d(16, 1, 4, stride=2, padding=1, bias=False),
        #     nn.BatchNorm2d(1),
        #     nn.ReLU(inplace=True),
        # )

        # Squeezenet
        # self.model_decoder = nn.Sequential(
        #     nn.ConvTranspose2d(512, 256, 4, stride=2, bias=False),
        #     nn.BatchNorm2d(256),
        #     nn.ReLU(inplace=True),
        #     nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1, bias=False),
        #     nn.BatchNorm2d(128),
        #     nn.ReLU(inplace=True),
        #     nn.ConvTranspose2d(128, 32, 4, stride=2, padding=1, bias=False),
        #     nn.BatchNorm2d(32),
        #     nn.ReLU(inplace=True),
        #     nn.ConvTranspose2d(32, 2, 4, stride=2, padding=3, bias=False),
        #     nn.BatchNorm2d(2),
        #     nn.ReLU(inplace=True),
        # )
        
        # Mobilenet
        self.model_decoder = nn.Sequential(
            nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True),
            nn.ConvTranspose2d(1280, 320, 1, bias=False),
            nn.BatchNorm2d(320),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(320, 160, 4, stride=2, padding=2, bias=False),
            nn.BatchNorm2d(160),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(160, 64, 4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 32, 4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(32, 2, 4, stride=2, padding=3, bias=False),
            nn.BatchNorm2d(2),
            nn.ReLU(inplace=True),
        )
        
        self.model_decoder.apply(init_weights)
        
#         # Print Learnable parameters
#         params_to_update = []
#         for name,param in self.model_encoder.named_parameters():
#             if param.requires_grad == True:
#                 params_to_update.append(param)
#                 print("Encoder:\t",name)
#         for name,param in self.model_decoder.named_parameters():
#             if param.requires_grad == True:
#                 params_to_update.append(param)
#                 print("\Decoder:t",name)

        #######################################################################
        #                           END OF YOUR CODE                          #
        #######################################################################
        
    def initialize_encoder_model(self, feature_extract=True, use_pretrained=True):
        model_ft = models.mobilenet_v2(pretrained=use_pretrained)
        # model_ft = models.alexnet(pretrained=use_pretrained)
        # model_ft = models.squeezenet1_1(pretrained=use_pretrained)
        # print(model_ft)
        if feature_extract:
            for param in model_ft.parameters():
                param.requires_grad = False

        # For Mobilenet, Alexnet                
        newmodel = torch.nn.Sequential(*(list(model_ft.children())[:-1]))
        # print(newmodel)
        return newmodel

    def forward(self, x):
        """
        Forward pass of the convolutional neural network. Should not be called
        manually but by calling a model instance directly.

        Inputs:
        - x: PyTorch input Variable
        """
        #######################################################################
        #                             YOUR CODE                               #
        #######################################################################

        x = self.model_encoder(x)
        x = self.model_decoder(x)

        #######################################################################
        #                           END OF YOUR CODE                          #
        #######################################################################

        return x

    @property
    def is_cuda(self):
        """
        Check if model parameters are allocated on the GPU.
        """
        return next(self.parameters()).is_cuda

    def save(self, path):
        """
        Save model with its parameters to the given path. Conventionally the
        path should end with "*.model".

        Inputs:
        - path: path string
        """
        print('Saving model... %s' % path)
        torch.save({
            'encoder_state_dict': self.model_encoder.cpu().state_dict(),
            'decoder_state_dict': self.model_decoder.cpu().state_dict(),
            }, path)
    
    def load(self, path):
        """
        Save model with its parameters to the given path. Conventionally the
        path should end with "*.model".

        Inputs:
        - path: path string
        """
        print('Loading model... %s' % path)
        checkpoint = torch.load(path,     map_location=torch.device(self.device))
        self.model_encoder.load_state_dict(checkpoint['encoder_state_dict'])
        self.model_decoder.load_state_dict(checkpoint['decoder_state_dict'])
        
