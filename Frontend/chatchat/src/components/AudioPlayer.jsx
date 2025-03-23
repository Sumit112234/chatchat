import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

const AudioPlayer = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    message.type === "audio" && (
      <motion.div
        className="w-full max-w-md flex items-center justify-between bg-gray-200 dark:bg-blue-950 rounded-lg p-3 shadow-md border border-gray-300 dark:border-blue-800"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="p-2 bg-gray-300 dark:bg-blue-900 rounded-full hover:bg-gray-400 dark:hover:bg-blue-800 transition-all duration-200"
        >
          {isPlaying ? <Pause size={24} className="text-gray-800 dark:text-white" /> : <Play size={24} className="text-gray-800 dark:text-white" />}
        </button>

        {/* Audio Element */}
        <audio ref={audioRef} src={message.media} className="hidden" />

        {/* Audio Info */}
        <div className="flex-1 text-center text-gray-700 dark:text-gray-200 text-sm">
          Audio Message
        </div>
      </motion.div>
    )
  );
};

export default AudioPlayer;
