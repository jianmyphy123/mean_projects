import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

export default StyleSheet.create({
    "show-hide-messageng-hide-remove": {
        "WebkitAnimation": "zoomIn 0.3s both ease",
        "MozAnimation": "zoomIn 0.3s both ease",
        "animation": "zoomIn 0.3s both ease"
    },
    "spinner": {
        "WebkitAnimation": "spin 1s infinite",
        "MozAnimation": "spin 1s infinite",
        "animation": "spin 1s infinite"
    },
    "reset": {
        "float": "right"
    }
});