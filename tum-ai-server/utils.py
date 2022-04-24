import numpy as np
import cv2

SEG_LABELS_LIST = [
    {"id": 1, "name": "void", "rgb_values": [0,   0,    0]},
    {"id": 0,  "name": "test", "rgb_values": [0,   255,  0]}
    ]


def label_img_to_rgb(label_img):
    label_img = np.squeeze(label_img)
    labels = np.unique(label_img)
    label_infos = [l for l in SEG_LABELS_LIST if l['id'] in labels]

    label_img_rgb = np.array([label_img,
                              label_img,
                              label_img]).transpose(1,2,0)
    for l in label_infos:
        mask = label_img == l['id']
        label_img_rgb[mask] = l['rgb_values']

    return label_img_rgb.astype(np.uint8)


def detect_max_rect(img, contours):
    """
    Detect maximum contour-rectangle within image.
    """
    #Index of contours taking the maximum area
    max_idx = 0

    for i in range(len(contours)):
        if cv2.contourArea(contours[max_idx]) < cv2.contourArea(contours[i]):
            max_idx = i
    return max_idx


def crop_rect(img, rect):
    """
    Crop a rectangle from given image.
    """
    center, size, angle = rect
    center = tuple(map(int, center))  # float -> int
    size = tuple(map(int, size))  # float -> int
    h, w = img.shape[:2]  #Image height and width

    #Get height and width of rect
    height,width=size

    #Since angle indicates the angle formed by the horizontal line,+90
    if width/height < 0.5:
        height, width = width, height
        angle += 90
    #if angle<0:
    #    angle+=90

    #Rotate the image using the affine matrix
    M = cv2.getRotationMatrix2D(center, angle, 1)
    rotated = cv2.warpAffine(img, M, (w, h))

    #cut out
    cropped = cv2.getRectSubPix(rotated, (height, width), center)
    return cropped
