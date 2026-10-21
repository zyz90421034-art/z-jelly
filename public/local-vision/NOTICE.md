# Device-side vision assets

- MobileNet V1 alpha 1.0, 224px, Google/TensorFlow: https://blog.tensorflow.org/2018/04/a-gentle-introduction-to-tensorflowjs.html
- Original weights: https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json . Original float32 weights were converted to float16 for kernels, while normalization parameters retain float32 precision. The packed data is split into ordered weights-*.bin files; TensorFlow.js decodes it locally at load time. Apache-2.0.
- ImageNet class labels from TensorFlow.js MobileNet 2.1.1, Copyright 2019 Google LLC, Apache-2.0: https://github.com/tensorflow/tfjs-models/tree/master/mobilenet
- MediaPipe BlazeFace front detector, TensorFlow.js conversion distributed by Vladimir Mandic: https://github.com/vladmandic/human-models/tree/main/models . MIT license retained in face/LICENSE. Original MediaPipe model is Apache-2.0.

These models classify object categories and detect face boxes locally. They do not reconstruct a 3D mesh, identify people, or transmit uploaded images. The object-part recipes and procedural geometry are project code.
