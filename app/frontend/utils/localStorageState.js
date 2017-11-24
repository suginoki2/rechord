import { localStorage } from "./browser-dependencies"

const localStorageKey = "rechordState"
const commonKey = "rechord"

export const get = () => {
  if (!localStorage) return false

  const state = localStorage.getItem(localStorageKey)
  if (!state) return false

  return JSON.parse(state)
}

export const set = (state) => {
  if (!localStorage) return false

  const { update, title, inputText, enabledClick, bpm, volume, beat, instrumentType, status } = state
  if (update) return false

  return localStorage.setItem(localStorageKey, JSON.stringify({
    title, inputText, enabledClick, bpm, volume, beat, instrumentType, status
  }))
}

export const remove = () => {
  if (!localStorage) return false
  return localStorage.removeItem(localStorageKey)
}

export const visit = () => {
  if (!localStorage) return false
  return localStorage.setItem(commonKey, JSON.stringify({ isVisited: true }))
}
export const isVisited = () => {
  if (!localStorage) return false

  const state = JSON.parse(localStorage.getItem(commonKey))
  if (!state) return false

  return !!state.isVisited
}