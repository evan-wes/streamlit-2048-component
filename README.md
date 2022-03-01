# Custom Streamlit Component for the 2048 game

This repo contains a React component for the game 2048 cloned from [this repo](https://github.com/mateuszsokola/2048-in-react/) developed by Matt Sokola.

In this repo, I have incorporated the above frontend code into a custom Streamlit component. The component will be inserted into my 2048 AI project after testing and making a few planned modifications:
 - [X] Component is working in Streamlit
 - [X] Add scoring
 - [X] Add capability to return data to streamlit containing the game state and move/board history
 - [X] Add capability to randomize starting tile locations
 - [X] Add capability to generate a new tile with value of 2 or 4 (with 95% and 5% probability respectively) after a move, instead of always 2
 - [ ] Add capability of input to be recieved from streamlit
 - [ ] Add ability to check game over status
 - [ ] Add more styles past 2048 tile

The last modification is what will enable this component to be used in building an AI to play the game by learning play how to play from datasets of many games. The purpose of using a custom component is that the streamlit app is not rerun top-to-bottom whenever a player makes a move, as in the current implementation. The game also looks and plays much nicer than my current basic HTML/CSS frontend.

To run the component, you must have `Streamlit` and `Node.js` installed. Open two terminals. In the first, cd to the `frontend` directory inside `streamlit_2048` and run `npm run start`. In the second terminal, run `streamlit run app.py`. You may need to recompile the front end code after cloning this repo by running `npm install` inside the `frontend` directory. If you need help, follow the "Project Setup" steps in this [extremely helpful guide](https://streamlit-components-tutorial.netlify.app/). to creating custom components for Streamlit.