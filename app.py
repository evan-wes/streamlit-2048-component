import streamlit as st
import numpy as np
import pandas as pd
from streamlit_2048 import st_2048

if 'game_id' not in st.session_state:
    st.session_state['game_id'] = 1

def string_array_to_numpy(str_arr):
    """Function to convert a string array back to numpy"""

    # arr_str = str_arr.replace(', ',',').replace(' ', ',')
    # return eval('np.array('+arr_str+')')
    return eval('np.array('+str_arr+', dtype="uint8")')

def analyse_game_record(record_df):
    
    df = pd.DataFrame()

    df['turn'] = record_df['turn']
    df['board'] = record_df['board'].apply(string_array_to_numpy)
    df['board_exp'] = record_df['board_exp'].apply(string_array_to_numpy)
    df['non_zero'] = df['board'].apply(lambda x: x[x>0])
    df['exp_non_zero'] = df['board_exp'].apply(lambda x: x[x>0])
    df['min'] = df['non_zero'].apply(np.min)
    df['max'] = df['non_zero'].apply(np.max)
    df['exp_min'] = df['exp_non_zero'].apply(np.min)
    df['exp_max'] = df['exp_non_zero'].apply(np.max)
    df['range'] = df['max'] - df['min']
    df['range_exp'] = df['exp_max'] - df['exp_min']

    # print(df['board_real_non_zero'])
    # print(df)
    # print(df['board_real'][0])
    # print(type(df['board_real'][0]))
    # print(df.dtypes)

    return df[['turn', 'min', 'max', 'exp_min', 'exp_max', 'range', 'range_exp']]

def convert_2048_component_return_value_to_dataframes(ret):
    """Function to process return value of react 2048 component into dataframes"""

    value_to_exp_map = {2**n : n for n in range(1, 15)}

    # df_cols = {'turn': [], 'score': [], 'move': [], 'board': [], 'board_exp': []}
    # game_dfs = {'default': pd.DataFrame(df_cols)}
    game_dfs = {}
    # Iterate over games in game dictionary
    for game_id, move_log in ret['game_log'].items():
        # Iterate over moves in move log dictionary
        move_ids = []
        scores = []
        moves = []
        boards = []
        board_exps = []
        for move_id, move_dict in move_log.items():
            # Initiate empty board
            board = np.zeros((4,4), dtype='uint8')
            board_exp = np.zeros((4,4), dtype='uint8')
            # Iterate over tiles to fill in board
            for tile in move_dict['tiles']:
                x, y = tile['position']
                board[y][x] = tile['value']
                board_exp[y][x] = value_to_exp_map[tile['value']]
            # Get exponential representation of board
            # Append move dictionary info to each list
            move_ids.append(move_id)
            scores.append(move_dict['score'])
            moves.append(move_dict['move'].replace('Arrow', ''))
            # boards.append(np.array2string(board))
            # board_exps.append(np.array2string(board_exp))
            boards.append(str(board.tolist()))
            board_exps.append(str(board_exp.tolist()))
            
        # Create dataframe for this game and add to dictionary
        game_df = pd.DataFrame({'turn': move_ids, 'score': scores, 'move': moves, 'board': boards, 'board_exp': board_exps})
        game_dfs[game_id] = game_df
    
    # Return dictionary of dataframes
    return game_dfs

def analyse_game_dfs(game_dfs):
    """Function to perform some rudimentary analysis on the game dataframes"""


st.title('Testing React 2048 app in Streamlit')
game_return_val = st_2048(player_name='Evan')

if game_return_val is not None:

    try:
        game_dfs = convert_2048_component_return_value_to_dataframes(game_return_val)
    except:
        st.warning('Try Again (You may need to make another move)')

    st.markdown(f"# Game log for player {game_return_val['name']}:")
    for game_id, game_df in game_dfs.items():
        
        st.markdown(f"## Game {game_id}:")
        st.write(game_df)
    
    st.markdown(f"# Game log analysis for player {game_return_val['name']}:")
    for game_id, game_df in game_dfs.items():
        st.markdown(f"## Game {game_id}:")
        try:
            df = analyse_game_record(game_df)
            st.write(df)
        except:
            st.warning('Try Again (You may need to make another move)')

    