import streamlit as st
from streamlit_2048 import st_2048

if 'game_id' not in st.session_state:
    st.session_state['game_id'] = 1

st.title('Testing React 2048 app in Streamlit')
this_game_id = st.session_state['game_id']
game_id_copy = int(this_game_id) + 30
game_return_val = st_2048(player_name='Evan')
if game_return_val is not None:
    st.write(f"Game info for streamlit session game_id: {this_game_id}:")
    st.write(game_return_val)

    st.session_state['game_id'] += 1

    st.write(game_return_val['name'])