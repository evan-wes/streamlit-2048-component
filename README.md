# Custom Streamlit Component for the 2048 game

This repo contains a React component for the game 2048 cloned from (https://github.com/mateuszsokola/2048-in-react/) developed by Matt Sokola.

In this repo, I have incorporated the above frontend code into a custom Streamlit component. The component will be inserted into my 2048 AI project after making a few planned modifications:
 - [] Add scoring
 - [] Add capability of input to be recieved from streamlit
 - [] Add capability to return data to streamlit containing the game state and move/board history

The last modification is what will enable this component to be used in building an AI to play the game by learning play how to play from datasets of many games. The purpose of using a custom component is that the streamlit app is not rerun top-to-bottom whenever a player makes a move, as in the current implementation. The game also looks and plays much nicer than my current basic HTML/CSS frontend.