import { Chord, Note, Distance }               from "tonal"
import translate                               from "./translate"
import { STREAK_NOTE, RESUME_NOTE, STOP_NOTE } from "../constants"
import { times }                               from "../constants/times"
import * as regex                              from "../constants/regex"

export const parseChordProgression = (text) => {
  let score = []

  score = text.replace(regex.rootChord, " $&")
  score = score.replace(regex.joinOnChord, "$1$2")
  score = score.split("\n")
  score = score.map(line => line.split("|"))
  score = score.map(line => (
    line[0][0] === "\n" ? line : (
      line
        .map(chords => chords.trim())
        .filter(chords => chords !== "")
        .map(chords => chords.split(/\s+/))
        .map(chords => chords.map(chord => Chord.tokenize(chord)))
    )
  ))
  return score
}

export const keyChange = (progression, operation) => {
  const newProgression = []
  const lines = progression.split(/\n/)
  lines.forEach(line => {
    if (line[0] === "\n") {
      newProgression.push(line)
    } else {
      const notesRegExp = /(^|\||\n)?\s*(C#|Db|D#|Eb|F#|Gb|G#|Ab|A#|Bb|C|D|E|F|G|A|B)/g
      const transposeNote = (note, p1, p2) => {
        const interval = operation === "up" ? "2m" : "-2m"
        const newNote = Note.simplify(Distance.transpose(p2, interval), false)
        return note.replace(p2, `___${newNote}`)
      }
      newProgression.push(line.replace(notesRegExp, transposeNote).replace(/___/g, ""))
    }
  })
  return newProgression.join("\n")
}

const setBeats = (length, selectedTime) => {
  if (length === 1) return [0]

  const beat = times[selectedTime][0]
  const beats = []

  if (beat / length >= 2) {
    for (let i = 0; i < beat; i += 1) {
      if (i % length === 0) beats.push(i)
    }
  } else {
    for (let i = 0; i < beat; i += 1) {
      beats.push(i)
    }
  }
  return beats
}

const upOctave = (note) => Distance.transpose(note, "8M")
const fixNotes = (chord, baseKey) => {
  const root        = chord[0]
  const denominator = chord[1].split("/")[1]
  const type        = chord[1].split("/")[0]
  const notes       = Chord.notes(`${root}${baseKey}`, translate(type))

  const maxNotes = 5
  const minNotes = 3
  for (let i = notes.length - minNotes; i < maxNotes - minNotes; i += 1) {
    notes.push(upOctave(notes[i]))
  }
  if (denominator && denominator.length > 0 && denominator !== root) {
    const distance = Distance.semitones(`${root}${baseKey}`, `${denominator}${baseKey}`)

    if (distance < 5 && distance >= 0) {
      // 1度の構成音を削除して5度の構成音のオクターブ上を足す
      notes.splice(0, 1)
      notes.push(upOctave(notes[1]))
    } else if (distance < 0) {
      // 1度の構成音を削除して一番下に分母の音を足す
      notes.unshift(`${denominator}${baseKey}`)
      notes.splice(1, 1)
    } else {
      // 3度の構成音を削除して一番下に分母の音を足す
      notes.unshift(`${denominator}${baseKey - 1}`)
      notes.splice(2, 1)
    }
  }
  return notes.map(Note.simplify)
}

export const makeScore = (text, selectedTime) => {
  const score = []
  const baseKey = 3
  let bar = 0

  text.forEach(line => {
    if (!line) return false

    line.forEach(chords => {
      const beats = setBeats(chords.length, selectedTime)
      chords.forEach((chord, index) => {
        if (beats.length <= index) return false

        const time = `${bar}:${beats[index]}:0`
        const notes = () => {
          switch (chord[1][0]) {
            case STREAK_NOTE: return STREAK_NOTE
            case RESUME_NOTE: return RESUME_NOTE
            case STOP_NOTE:   return []
            default: {
              return fixNotes(chord, baseKey)
            }
          }
        }
        return score.push({ time, notes: notes() })
      })
      bar += 1
    })
    return true
  })
  score.push({ time: `${bar}:0:0`, notes: "fin" })
  return score
}

export const valueInRange = (value, min, max) => {
  if (value < min) return min
  if (max < value) return max
  return value
}
