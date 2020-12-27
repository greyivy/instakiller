import { Component, createElement, h, render } from 'preact';

export const StatusImage = (props) => {
  return (
    <img src={props.media.url} alt={props.media.description}/>
  )
}

export const StatusVideo = (props) => {
  return (
    <video src={props.media.url} controls/>
  )
}

export const StatusAudio = (props) => {
  return (
    <audio src={props.media.url} controls/>
  )
}

export const StatusGif = (props) => {
  return (
    <img src={props.media.url} alt={props.media.description}/>
  )
}