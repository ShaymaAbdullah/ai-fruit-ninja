import { useEffect, useRef } from "react";

function GameCanvas({ fingerTip }) {
    const scoreRef = useRef(0);
    const canvasRef = useRef(null);
    const fragmentsRef = useRef([]);

    // نخزن آخر نقاط السيف
    const trailRef = useRef([]);

    // نخزن الإصبع بدون إعادة رندر
    const fingerTipRef = useRef(null);

    const fruitsRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener("resize", resize);

        function createFragments(fruit) {
            return [
                {
                    x: fruit.x,
                    y: fruit.y,
                    vx: -2,
                    vy: -5,
                    size: fruit.size / 2,
                    life: 60,
                },
                {
                    x: fruit.x,
                    y: fruit.y,
                    vx: 2,
                    vy: -5,
                    size: fruit.size / 2,
                    life: 60,
                },
            ];
        }

        function spawnFruit() {
            const size = 40 + Math.random() * 20;

            fruitsRef.current.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                vx: (Math.random() - 0.5) * 4,
                vy: -10 - Math.random() * 8,
                size,
            });
        }

        const spawnInterval = setInterval(() => {
            spawnFruit();
        }, 1000);
        function checkCollision(fruit, trail) {
            for (let point of trail) {
                const dx = fruit.x - point.x;
                const dy = fruit.y - point.y;

                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < fruit.size) {
                    return true;
                }
            }
            return false;
        }

        function draw() {
            if (!fingerTipRef.current) {
                trailRef.current = [];
            }

            const canvas = canvasRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ========= تحديث الفواكه =========
            fruitsRef.current.forEach((fruit) => {
                fruit.x += fruit.vx;
                fruit.y += fruit.vy;
                fruit.vy += 0.2;
            });

            fruitsRef.current = fruitsRef.current.filter((fruit) => {
                const hit = checkCollision(fruit, trailRef.current);

                if (hit) {
                    scoreRef.current += 1;

                    const newFrags = createFragments(fruit);
                    fragmentsRef.current.push(...newFrags);

                    return false;
                }

                return true;
            });

            fragmentsRef.current.forEach((f) => {
                f.x += f.vx;
                f.y += f.vy;
                f.vy += 0.2;
                f.life -= 1;
            });

            // ========= رسم الفواكه =========
            fruitsRef.current.forEach((fruit) => {
                ctx.beginPath();
                ctx.fillStyle = "#ff4d4d";
                ctx.shadowColor = "#ff4d4d";
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(fruit.x, fruit.y, fruit.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;
            fragmentsRef.current.forEach((f) => {
                ctx.beginPath();
                ctx.fillStyle = "#ff9999";
                ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
                ctx.fill();
            });

            fragmentsRef.current = fragmentsRef.current.filter(
                (f) => f.life > 0
            );
            // تنظيف shadow (مهم جدًا)
            ctx.shadowBlur = 0;

            fruitsRef.current = fruitsRef.current.filter(
                (fruit) => fruit.y < window.innerHeight + 100
            );

            // ========= السيف =========
            const currentFinger = fingerTipRef.current;

            if (currentFinger && currentFinger.x != null) {
                const x = (1 - currentFinger.x) * canvas.width;
                const y = currentFinger.y * canvas.height;

                trailRef.current.push({ x, y });

                if (trailRef.current.length > 15) {
                    trailRef.current.shift();
                }
            } else {
                trailRef.current = [];
            }
            ctx.beginPath();

            trailRef.current.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });

            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 6;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 35;

            ctx.stroke();

            requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            clearInterval(spawnInterval);
        };
    }, []);

    // تحديث قيمة اليد بدون إعادة تشغيل الرسم
    useEffect(() => {
        fingerTipRef.current = fingerTip;
    }, [fingerTip]);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: "fixed",
                    inset: 0,
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "fixed",
                    top: 20,
                    left: 20,
                    color: "white",
                    fontSize: "24px",
                    zIndex: 10,
                    fontFamily: "Arial",
                }}
            >
                Score: {scoreRef.current}
            </div>
        </>
    );
}

export default GameCanvas;