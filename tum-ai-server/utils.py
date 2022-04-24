import numpy as np

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