#!/usr/bin/env python
# encoding: utf-8
# Run in base conda env
# Requirements Flask, pillow, python-opencv, numpy, torch, pytorch_lightning, torchvision
import os
import numpy as np
import cv2
import base64
from PIL import Image
from flask import Flask, request, send_from_directory
from flask_cors import CORS
import logging

import random

import torch
from torchvision import transforms
loader = transforms.Compose([transforms.ToTensor()])

from utils import label_img_to_rgb

from segmentation_nn import SegmentationNN
model = SegmentationNN()

model.load('./models/model_mobilenet.pth')
model.eval()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('flask-server')

app = Flask(__name__, static_folder='client/build')
CORS(app)

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/upload', methods=['POST'])
def fileUpload():
    logger.info("newUpload")
    num = random.randint(1, 1000)
    data = request.get_json()["image"]
    encoded_data = data.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    img_pil.save(f"./image/input-{num}.jpg")
    model_input = img_pil.resize((300,300))
    model_input = loader(model_input).float()
    model_input = torch.tensor(model_input, requires_grad=False)
    model_input = model_input.unsqueeze(0)
    outputs = model.forward(model_input)
    _, preds = torch.max(outputs, 1)
    pred = preds[0].data.cpu().numpy()
    cv2.imwrite(f"./image/output-{num}.jpg", label_img_to_rgb(pred))
    cv2.imshow("Prediction", label_img_to_rgb(pred))
    cv2.waitKey(0)
    response="Whatever you wish too return"
    return response

app.run(use_reloader=True, port=5000, threaded=True)