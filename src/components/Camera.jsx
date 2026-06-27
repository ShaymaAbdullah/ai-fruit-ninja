import { useEffect, useRef } from "react";
import useHandTracking from "../hooks/useHandTracking";
import GameCanvas from "./GameCanvas";

function Camera() {
    const videoRef = useRef(null);

    const fingerTip =
        useHandTracking(videoRef);

    useEffect(() => {
        async function startCamera() {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                });

            videoRef.current.srcObject = stream;

            await videoRef.current.play();
        }

        startCamera();
    }, []);

    return (
        <>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                }}
            />

            <GameCanvas fingerTip={fingerTip} />
        </>
    );
}

export default Camera;