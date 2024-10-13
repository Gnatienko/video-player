import React, { useState, useEffect, useRef } from "react"
import ReactPlayer from "react-player"
import SubtitlesParser from "subtitles-parser"
import "./App.css"
import Menu from "./Menu/Menu.js"
import Subtitles from "./Subtitles"
import { handleKeyDown, handleKeyUp } from "./keyboardHandler.js"
import { ReactComponent as DoubleArrowDown } from "./assets/double-arrow-down-6.svg"

const App = () => {
  const playerRef = useRef(null)
  const [translationLanguage, setTranslationLanguage] = useState("en")
  const [translationLanguageFrom, setTranslationLanguageFrom] = useState("auto")
  const [fileUrl, setFileUrl] = useState("")
  const [subtitlesFileUrl, setSubtitlesFileUrl] = useState("")
  const [currentSubtitle, setCurrentSubtitle] = useState([])
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0)
  const [parsedSubtitles, setParsedSubtitles] = useState([
    { startTime: 1, text: 1 },
  ])
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFullTranslation, setShowFullTranslation] = useState(false)
  const [showArrow, setShowArrow] = useState(true)

  const handleMouseEnter = () => {
    setIsPlaying(false)
  }

  const handleMouseLeave = () => {
    setIsPlaying(true)
  }

  useEffect(() => {
    const subtitlesAdjustmentMils = 1 // todo, subs adjustment not working
    fetch(subtitlesFileUrl)
      .then((response) => response.text())
      .then((data) => {
        const parsedSubtitles = SubtitlesParser.fromSrt(
          data.replace(/<i>|<\/i>|<br\s*\/?>/gi, " "), // todo add /n
          true
        ).map((subtitles) => ({
          ...subtitles,
          startTime: subtitles.startTime + subtitlesAdjustmentMils,
        }))
        setParsedSubtitles(parsedSubtitles)
      })
  }, [subtitlesFileUrl])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 5) {
        setShowArrow(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleProgress = (state) => {
    const PlayedMillisecond = state.playedSeconds * 1000
    const currentLine = parsedSubtitles.find(
      (subtitle) =>
        subtitle.startTime < PlayedMillisecond &&
        subtitle.endTime > PlayedMillisecond
    )
    setCurrentSubtitle(currentLine ? currentLine.text.split(" ") : [])
    const currentLineIndex =
      parsedSubtitles.findIndex(
        (subtitle) =>
          subtitle.startTime > PlayedMillisecond &&
          subtitle.endTime > PlayedMillisecond
      ) - 1
    setCurrentSubtitleIndex(currentLineIndex)
  }

  return (
    <div
      onKeyDown={(event) =>
        handleKeyDown(
          event,
          playerRef,
          parsedSubtitles,
          currentSubtitleIndex,
          setCurrentSubtitle,
          setIsPlaying,
          setShowFullTranslation
        )
      }
      onKeyUp={(event) =>
        handleKeyUp(event, setIsPlaying, setShowFullTranslation)
      }
      style={{ background: "black" }}
    >
      <div className="player">
        <ReactPlayer
          ref={playerRef}
          playing={isPlaying}
          onProgress={handleProgress}
          url={fileUrl}
          controls={true}
          width="100%"
          height="100%"
        />
        {showArrow && (
          <div className="blinking-arrow">
            <DoubleArrowDown className="arrow-icon" />
          </div>
        )}
      </div>
      <Subtitles
        currentSubtitle={currentSubtitle}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        showTranslation={showFullTranslation}
        translationLanguage={translationLanguage}
        translationLanguageFrom={translationLanguageFrom}
      />
      <Menu
        setFileUrl={setFileUrl}
        setSubtitlesFileUrl={setSubtitlesFileUrl}
        translationLanguage={translationLanguage}
        translationLanguageFrom={translationLanguageFrom}
        setTranslationLanguage={setTranslationLanguage}
        setTranslationLanguageFrom={setTranslationLanguageFrom}
      />
    </div>
  )
}

export default App
