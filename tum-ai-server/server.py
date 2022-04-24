#!/usr/bin/env python
# encoding: utf-8
# Run in base conda env
# Requirements Flask, pillow, python-opencv, numpy, torch, pytorch_lightning, torchvision
import json
import os

import numpy as np
import cv2
import base64
from PIL import Image
from flask import Flask, request
from flask_cors import CORS
import logging

from segmentation_nn import SegmentationNN
import torch

model = torch.jit.load('./models/model_squeezenet.pt')
model.eval()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('flask-server')

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return json.dumps({'server': 'Flask',
                       'project': 'TUM-AI-4tb-Server'})

@app.route('/upload', methods=['POST'])
def fileUpload():
    logger.info("newUpload")
    data = request.get_json()["image"]
    encoded_data = data.split(',')[1]
    nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb)
    model_input = img_pil.resize((300,300))
    pred = model(model_input)
    cv2.imshow("Prediction", pred)
    response="Whatever you wish too return"
    return response

app.run()