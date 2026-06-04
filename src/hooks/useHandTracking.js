import { useEffect, useState } from "react";
import {
    FilesetResolver,
    HandLandmarker,
} from "@mediapipe/tasks-vision";

export default function useHandTracking(videoRef) {
    const [fingerTip, setFingerTip] = useState(null);

    useEffect(() => {
        let handLandmarker;

        async function init() {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
            );

            handLandmarker = await HandLandmarker.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                    },
                    runningMode: "VIDEO",
                    numHands: 1,
                }
            );

            await new Promise((resolve) => {
                videoRef.current.onloadeddata = () => {
                    resolve();
                };
            });

            detect();
        }


        async function detect() {
            if (
                !videoRef.current ||
                videoRef.current.readyState < 2
            ) {
                requestAnimationFrame(detect);
                return;
            }

            const results =
                handLandmarker.detectForVideo(
                    videoRef.current,
                    performance.now()
                );

            if (results.landmarks.length > 0) {
                const indexFinger =
                    results.landmarks[0][8];

                setFingerTip(indexFinger);
            }

            requestAnimationFrame(detect);
        }

        init();
    }, [videoRef]);

    return fingerTip;
}