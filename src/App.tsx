import { useRef, useEffect, useState, useCallback } from "react";
import { handles } from "./constants";

const CIRCLE_RADIUS = 400;
const RADIUS_FRACTION_INSIDE_CONTAINER = 0.2;
const d = CIRCLE_RADIUS * (1 - RADIUS_FRACTION_INSIDE_CONTAINER);

// New global variable to control the number of handles per line
const HANDLES_PER_LINE = 3;

// Array of background color classes
const bgColors = ["bg-blue-500", "bg-blue-600", "bg-blue-700", "bg-blue-800"];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tweetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const animationRef = useRef<number>();

  const getXDelta = useCallback(
    (tweetY: number) => {
      if (containerRect) {
        const containerCenterY = containerRect.y + containerRect.height / 2;
        const delta =
          Math.sqrt(
            CIRCLE_RADIUS * CIRCLE_RADIUS -
              (containerCenterY - tweetY) * (containerCenterY - tweetY)
          ) +
          d -
          CIRCLE_RADIUS;
        return delta;
      }
      return 0;
    },
    [containerRect]
  );

  // to be used!
  const getAngle = useCallback(
    (tweetY: number, shiftedX: number) => {
      if (!containerRect) {
        return 0;
      }
      // compare with the left center of containerRect
      const m = containerRect.x;
      const n = containerRect.y + containerRect.height / 2;
      const angle = Math.atan((tweetY - n) / (m - shiftedX));
      return angle;
    },
    [containerRect]
  );

  const updateTweetPositions = useCallback(() => {
    if (containerRect) {
      tweetRefs.current.forEach((tweetRef) => {
        if (tweetRef) {
          const tweetRect = tweetRef.getBoundingClientRect();
          const tweetY = tweetRect.y + tweetRect.height / 2;
          const xDelta = getXDelta(tweetY);
          tweetRef.style.transform = `translateX(${xDelta}px)`;
        }
      });
    }
    animationRef.current = requestAnimationFrame(updateTweetPositions);
  }, [containerRect, getXDelta]);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setContainerRect(entry.target.getBoundingClientRect());
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateTweetPositions);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateTweetPositions]);

  // Function to get a random background color
  const getRandomBgColor = () => {
    return bgColors[Math.floor(Math.random() * bgColors.length)];
  };

  // Function to render handles for a single line
  const renderHandleLine = (startIndex: number) => (
    <div
      key={startIndex}
      ref={(el) => (tweetRefs.current[startIndex / HANDLES_PER_LINE] = el)}
      className="mb-4"
    >
      {Array.from({ length: HANDLES_PER_LINE }).map((_, index) => (
        <span
          key={index}
          className={`${getRandomBgColor()} mr-2 rounded-full px-2 py-1`}
        >
          {handles[(startIndex + index) % handles.length]}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-black min-h-screen flex justify-center items-center text-white">
      <div
        ref={containerRef}
        className="max-h-[700px] relative flex flex-col-reverse overflow-hidden h-full max-w-[700px] w-full gap-4 text-xs"
      >
        <section className="scroll-down flex flex-col">
          {Array.from({ length: 25 }).map((_, index) =>
            renderHandleLine(index * HANDLES_PER_LINE)
          )}
        </section>
        <section className="scroll-down flex flex-col">
          {Array.from({ length: 25 }).map((_, index) =>
            renderHandleLine((index + 25) * HANDLES_PER_LINE)
          )}
        </section>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 via-90% to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 via-90% to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/5 via-90% to-black"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[300px]">
            <h1 className="text-3xl font-semibold mb-2">
              All your favs are here.
            </h1>
            <p className="text-zinc-400 mb-5">
              Typefully is your favorite twitter person's favorite tool. See all
              the accounts that are growing with Typefully.
            </p>
            <button className="bg-gradient-to-b from-blue-500 to-blue-700 px-4 py-2 rounded-full">
              Get started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
