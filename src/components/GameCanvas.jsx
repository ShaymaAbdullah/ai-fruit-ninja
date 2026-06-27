import { useEffect, useRef, useState } from "react";

function GameCanvas({ fingerTip }) {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const scoreRef = useRef(0);
    const canvasRef = useRef(null);
    const fragmentsRef = useRef([]);
    const gameOverRef = useRef(false);
    const gameStartedRef = useRef(false);
    const shakeRef = useRef(0);

    // نخزن آخر نقاط السيف
    const trailRef = useRef([]);

    // نخزن الإصبع بدون إعادة رندر
    const fingerTipRef = useRef(null);

    const fruitsRef = useRef([]);


    const watermelonSlicedRef = useRef(null);
    const orangeSlicedRef = useRef(null);
    const pineappleSlicedRef = useRef(null);
    const strawberrySlicedRef = useRef(null);


    useEffect(() => {

        const watermelon = new Image();
        watermelon.src = "/fruits/watermelon-sliced.svg";
        watermelonSlicedRef.current = watermelon;

        const orange = new Image();
        orange.src = "/fruits/orange-sliced.svg";
        orangeSlicedRef.current = orange;

        const pineapple = new Image();
        pineapple.src = "/fruits/pineapple-sliced.svg";
        pineappleSlicedRef.current = pineapple;

        const strawberry = new Image();
        strawberry.src = "/fruits/strawberry-sliced.svg";
        strawberrySlicedRef.current = strawberry;
    }, []);

    const bombExplosionImgRef = useRef(null);

    useEffect(() => {
        const img = new Image();
        img.src = "/fruits/bomb-explosion.svg";
        bombExplosionImgRef.current = img;
    }, []);

    function restartGame() {
        scoreRef.current = 0;

        fruitsRef.current = [];
        fragmentsRef.current = [];
        trailRef.current = [];

        gameOverRef.current = false;

        setGameOver(false);
        setGameStarted(true);

        gameStartedRef.current = true;
    }

    function addShake(intensity = 10) {
        shakeRef.current = intensity;
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener("resize", resize);


        function spawnFruit() {
            const fruitType = fruitsAssets[Math.floor(Math.random() * fruitsAssets.length)];

            const size =
                fruitType.min + Math.random() * (fruitType.max - fruitType.min);

            fruitsRef.current.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                vx: (Math.random() - 0.5) * 4,
                vy: -10 - Math.random() * 8,
                size,
                img: fruitType.img,
                type: fruitType.type,
            });
        }

        const spawnInterval = setInterval(() => {
            spawnFruit();
        }, 1000);

        const fruitsAssets = [
            {
                img: new Image(),
                src: "/fruits/watermelon.svg",
                min: 95,
                max: 115,
                type: "watermelon",
            },

            {
                img: new Image(),
                src: "/fruits/pineapple.svg",
                min: 85,
                max: 100,
                type: "pineapple",
            },

            {
                img: new Image(),
                src: "/fruits/orange.svg",
                min: 70,
                max: 85,
                type: "orange",
            },

            {
                img: new Image(),
                src: "/fruits/strawberry.svg",
                min: 75,
                max: 95,
                type: "strawberry",
            },

            {
                img: new Image(),
                src: "/fruits/bomb.svg",
                min: 80,
                max: 100,
                type: "bomb",
            },
        ];


        fruitsAssets.forEach(f => {
            f.img.src = f.src;
        });

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

        function createJuice(x, y) {
            for (let i = 0; i < 10; i++) {
                fragmentsRef.current.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    life: 30,
                    size: 2 + Math.random() * 3,
                });
            }
        }
        function getSlicedImage(type) {
            switch (type) {
                case "watermelon":
                    return watermelonSlicedRef.current;
                case "orange":
                    return orangeSlicedRef.current;
                case "pineapple":
                    return pineappleSlicedRef.current;
                case "strawberry":
                    return strawberrySlicedRef.current;
                default:
                    return watermelonSlicedRef.current;
            }
        }
        function draw() {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");

            const shake = shakeRef.current;

            ctx.save();
            ctx.translate(
                (Math.random() - 0.5) * shake,
                (Math.random() - 0.5) * shake
            );
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!gameStartedRef.current) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = "rgba(0,0,0,0.85)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                requestAnimationFrame(draw);
                return;
            }

            if (gameOverRef.current) {
                requestAnimationFrame(draw);
                return;
            }

            if (!fingerTipRef.current) {
                trailRef.current = [];
            }

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

                    if (fruit.type === "bomb") {

                        fragmentsRef.current.push({
                            x: fruit.x,
                            y: fruit.y,
                            vx: 0,
                            vy: 0,
                            img: bombExplosionImgRef.current,
                            life: 40,
                            rotation: 0,
                        });

                        addShake(25);

                        setTimeout(() => {
                            gameOverRef.current = true;
                            setGameOver(true);
                        }, 500);

                        return false;
                    }

                    scoreRef.current += 1;

                    // 💥 اهتزاز
                    addShake(12);

                    // 🍉 استبدال الفاكهة بفاكهة مقطوعة
                    fragmentsRef.current.push({
                        x: fruit.x,
                        y: fruit.y,
                        vx: -2,
                        vy: -3,
                        img: getSlicedImage(fruit.type),
                        life: 80,
                        rotation: Math.random(),
                    });
                    createJuice(fruit.x, fruit.y);

                    return false;
                }

                return true;
            });

            fragmentsRef.current.forEach((f) => {
                // 💥 حركة + جاذبية
                f.x += f.vx;
                f.y += f.vy;
                f.vy += 0.25; // gravity
                f.life -= 1;

                if (f.img) {
                    ctx.save();
                    ctx.translate(f.x, f.y);
                    ctx.rotate(f.rotation || 0);

                    ctx.drawImage(f.img, -60, -60, 120, 120);

                    ctx.restore();
                } else {
                    ctx.beginPath();
                    ctx.fillStyle = "#ff9999";
                    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            fragmentsRef.current = fragmentsRef.current.filter(
                (f) => f.life > 0
            );

            // ========= رسم الفواكه =========
            fruitsRef.current.forEach((fruit) => {
                ctx.beginPath();
                ctx.fillStyle = "#ff4d4d";
                ctx.shadowColor = "#ff4d4d";
                ctx.shadowBlur = 15;
                ctx.drawImage(
                    fruit.img,
                    fruit.x - fruit.size,
                    fruit.y - fruit.size,
                    fruit.size * 2,
                    fruit.size * 2

                );

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
            const drawSword = () => {
                if (trailRef.current.length < 2) return;

                // ====== GLOW LAYER (خفيف وعريض) ======
                ctx.beginPath();
                ctx.lineWidth = 18;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                ctx.strokeStyle = "rgba(120, 200, 255, 0.12)";
                ctx.shadowColor = "#7fd3ff";
                ctx.shadowBlur = 25;

                trailRef.current.forEach((p, i) => {
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });

                ctx.stroke();

                // ====== MID GLOW ======
                ctx.beginPath();
                ctx.lineWidth = 10;
                ctx.strokeStyle = "rgba(255,255,255,0.25)";
                ctx.shadowBlur = 15;

                trailRef.current.forEach((p, i) => {
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });

                ctx.stroke();

                // ====== CORE (الخط الأبيض القوي) ======
                ctx.beginPath();
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#ffffff";
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#ffffff";

                trailRef.current.forEach((p, i) => {
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });

                ctx.stroke();

                // reset
                ctx.shadowBlur = 0;
            };
            drawSword();
            console.log(fingerTipRef.current);
            ctx.restore();

            shakeRef.current *= 0.85; // fade out shake 

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
                    zIndex: 100,
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255,215,0,0.3)",
                    borderRadius: "16px",
                    padding: "12px 20px",
                    boxShadow: "0 0 20px rgba(255,215,0,0.25)",
                }}
            >
                <div
                    style={{
                        fontFamily: "'Fredoka One', cursive",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "12px",
                        letterSpacing: "2px",
                    }}
                >
                    SCORE
                </div>

                <div
                    style={{
                        color: "#ffd700",
                        fontSize: "34px",
                        fontWeight: "bold",
                        textShadow: "0 0 15px rgba(255,215,0,0.7)",
                    }}
                >
                    {scoreRef.current}
                </div>
            </div>

            {!gameStarted && (
                <>
                    <div
                        style={{
                            position: "fixed",
                            top: "22%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 999,
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'Luckiest Guy', cursive",
                                fontSize: "90px",
                                fontWeight: "900",
                                color: "#ffd700",
                                textShadow:
                                    "0 0 20px #ffd700, 0 0 40px #ff9800",
                                letterSpacing: "4px",
                            }}
                        >
                            FRUIT
                        </div>

                        <div
                            style={{
                                fontFamily: "'Luckiest Guy', cursive",
                                fontSize: "90px",
                                fontWeight: "900",
                                color: "#ff4d6d",
                                textShadow:
                                    "0 0 20px #ff4d6d, 0 0 40px #ff1744",
                                marginTop: "-15px",
                                letterSpacing: "4px",
                            }}
                        >
                            SLASH
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            gameStartedRef.current = true;
                            setGameStarted(true);
                        }}
                        style={{
                            fontFamily: "'Fredoka One', cursive",
                            position: "fixed",
                            top: "60%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            padding: "18px 50px",
                            borderRadius: "22px",
                            border: "none",
                            background:
                                "linear-gradient(135deg,#ff4d6d,#ff1744)",
                            color: "white",
                            fontSize: "30px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            boxShadow: "0 0 30px rgba(255,77,109,.7)",
                            zIndex: 999,
                        }}
                    >
                        START
                    </button>
                </>
            )}


            {gameOver && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.85)",
                        backdropFilter: "blur(8px)",
                        zIndex: 2000,

                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Fredoka One', cursive",
                            fontSize: "90px",
                            fontWeight: "900",
                            color: "#ff4d4d",
                            textShadow:
                                "0 0 20px #ff4d4d, 0 0 40px #ff0000",
                        }}
                    >
                        GAME OVER
                    </div>

                    <div
                        style={{
                            fontFamily: "'Fredoka One', cursive",
                            color: "white",
                            fontSize: "28px",
                            marginTop: "20px",
                        }}
                    >
                        Final Score
                    </div>

                    <div
                        style={{
                            color: "#ffd700",
                            fontSize: "60px",
                            fontWeight: "bold",
                            marginBottom: "40px",
                            textShadow: "0 0 20px #ffd700",
                        }}
                    >
                        {scoreRef.current}
                    </div>

                    <button
                        onClick={restartGame}
                        style={{
                            fontFamily: "'Fredoka One', cursive",
                            padding: "18px 50px",
                            borderRadius: "20px",
                            border: "none",
                            background:
                                "linear-gradient(135deg,#ffd700,#ff9800)",
                            color: "black",
                            fontWeight: "bold",
                            fontSize: "28px",
                            cursor: "pointer",
                            boxShadow:
                                "0 0 30px rgba(255,215,0,.6)",
                        }}
                    >
                        RESTART
                    </button>
                </div>
            )}

        </>
    );
}

export default GameCanvas;