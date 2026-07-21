import { useEffect, useRef } from "react";

const BAR_COUNT = 13;

function Waveform({ status }) {
  const barsRef = useRef([]);

  useEffect(() => {
    const bars = barsRef.current;

    if (!bars.length) return;

    let interval;

    const animate = () => {
      const middle = Math.floor(BAR_COUNT / 2);

      bars.forEach((bar, index) => {
        const distance = Math.abs(index - middle);

        const maxHeight = 60 - distance * 7;

        const height =
          status === "Speaking"
            ? Math.max(10, maxHeight * (0.4 + Math.random() * 0.6))
            : 10;

        bar.style.height = `${height}px`;
      });
    };

    animate();

    if (status === "Speaking") {
      interval = setInterval(animate, 80);
    }

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="mt-8 flex items-end justify-center gap-1 h-16">
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) barsRef.current[index] = el;
          }}
          className="w-[5px] rounded-full bg-gradient-to-t from-orange-600 to-orange-300 transition-all duration-75"
          style={{
            height: "10px",
          }}
        />
      ))}
    </div>
  );
}

export default Waveform;