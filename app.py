import streamlit as st
import os
import uuid
import numpy as np
import pandas as pd
from streamlit_2048 import st_2048

# uuid module to generate a random unique id
if 'uuid' not in st.session_state:
    st.session_state['uuid'] = uuid.uuid4()
    st.session_state['uuid_str'] = str(st.session_state['uuid'])
st.write(f"Session UUID: `{st.session_state['uuid']}`")

if 'game_id' not in st.session_state:
    st.session_state['game_id'] = 1

def string_array_to_numpy(str_arr):
    """Function to convert a string array back to numpy"""

    # arr_str = str_arr.replace(', ',',').replace(' ', ',')
    # return eval('np.array('+arr_str+')')
    str_arr = str_arr.replace('\n', '')
    return eval('np.array('+str_arr+', dtype="uint8")')

def analyse_game_record(record_df):
    
    df = pd.DataFrame()

    df[['score']] = record_df[['score']]
    df[['move']] = record_df[['move']]
    # df['turn'] = record_df['turn']
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

    # return df[['turn', 'min', 'max', 'exp_min', 'exp_max', 'range', 'range_exp']]
    return df[['score', 'move', 'min', 'max', 'exp_min', 'exp_max', 'range', 'range_exp']]

def convert_2048_component_return_value_to_dataframes(ret):
    """Function to process return value of react 2048 component into dataframes"""

    value_to_exp_map = {2**n : n for n in range(1, 15)}

    # df_cols = {'turn': [], 'score': [], 'move': [], 'board': [], 'board_exp': []}
    # game_dfs = {'default': pd.DataFrame(df_cols)}
    game_dfs = {}
    # Iterate over games in game dictionary
    for game_id, move_log in ret['game_log'].items():
        # Iterate over moves in move log dictionary
        # move_ids = []
        scores = []
        gameOvers = []
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
            # move_ids.append(move_id)
            scores.append(move_dict['score'])
            gameOvers.append(move_dict['gameOver'])
            moves.append(move_dict['move'].replace('Arrow', ''))
            # boards.append(np.array2string(board))
            # board_exps.append(np.array2string(board_exp))
            boards.append(str(board.tolist()).replace('], [', '],  \n  ['))
            board_str = str(board.tolist()).replace('], [', '],  \n  [').replace('0', ' . ')
            # st.write(f"""{board_str}""")
            board_exps.append(str(board_exp.tolist()).replace('], [', '],\n ['))
            
        # Create dataframe for this game and add to dictionary
        # game_df = pd.DataFrame({'turn': move_ids, 'score': scores, 'move': moves, 'board': boards, 'board_exp': board_exps})
        game_df = pd.DataFrame({'score': scores, 'gameOver': gameOvers, 'move': moves, 'board': boards, 'board_exp': board_exps})
        game_dfs[game_id] = game_df
    
    # Return dictionary of dataframes
    return game_dfs

def process_game_df(game_df):
    """
    Function to process the raw game move logs.
    Processing steps:
    1. Delete rows with duplicate boards:
        The game log can include extra moves when a board will not 
        change after a given move, and that move is repeated:
            - I.e. repeated "Down" moves when tiles are all stacked 
              vertically and cannot merge
        Once the player realizes the given move will not progress the 
        board, they choose a different move direction. The row with the 
        last repeated 'board' value is the one with the new move, and
        is the one to keep
    """
    # Correctly drop duplicates:
    processed_game_df = game_df.drop_duplicates(subset='board', keep='last')

    # Other processing steps do next...

    return processed_game_df


st.title('Testing React 2048 app in Streamlit')
game_return_val = st_2048(player_name='Evan')

if game_return_val is not None:

    try:
        game_dfs = convert_2048_component_return_value_to_dataframes(game_return_val)
    except:
        st.warning('Try Again (You may need to make another move)')

    
    st.markdown(f"# Game log for player {game_return_val['name']}:")
    for game_id, game_df in game_dfs.items():
        with st.expander(f'Expand game log for game {game_id}:'):
            st.markdown(f"## Game {game_id}:")
            processed_game_df = process_game_df(game_df)
            st.write(processed_game_df)#.drop(columns=['board_exp']))
    
    st.markdown(f"# Game log analysis for player {game_return_val['name']}:")
    analysis_dfs = {}
    for game_id, game_df in game_dfs.items():
        
        try:
            processed_game_df = process_game_df(game_df)
            analysis_dfs[game_id] = analyse_game_record(processed_game_df)
            with st.expander(f'Expand game analysis for game {game_id}:'):
                st.markdown(f"## Game {game_id}:")
                st.write(analysis_dfs[game_id])
            # st.write(df.drop_duplicates())
        except:
            st.warning('Try Again (You may need to make another move)')
    
    if st.button('Save game record'):
        save_dir = os.path.join('game_records', st.session_state['uuid_str'])
        if not os.path.isdir(save_dir):
            os.makedirs(save_dir)
        for game_id, game_df in game_dfs.items():
            st.write('Saving...')
            game_log_fn = f'game_id_{game_id}_game_log.csv'
            game_analysis_fn = f'game_id_{game_id}_game_analysis.csv'
            game_dfs[game_id].to_pickle(os.path.join(save_dir, game_log_fn))
            analysis_dfs[game_id].to_pickle(os.path.join(save_dir, game_analysis_fn))
            st.write(f"Saved Game Log: {os.path.join(save_dir, game_log_fn)}")
            st.write(f"Saved Game Analysis: {os.path.join(save_dir, game_analysis_fn)}")

    if st.button('Load game records'):
        save_dir = os.path.join('game_records', st.session_state['uuid_str'])
        for game_id in game_dfs.keys():
            game_log_fn = f'game_id_{game_id}_game_log.csv'
            game_analysis_fn = f'game_id_{game_id}_game_analysis.csv'
            read_log_df = pd.read_pickle(os.path.join(save_dir, game_log_fn))
            read_analysis_df = pd.read_pickle(os.path.join(save_dir, game_analysis_fn))
            st.write(f"Read Game Log: {os.path.join(save_dir, game_log_fn)}")
            st.write(f"Read Game Analysis: {os.path.join(save_dir, game_analysis_fn)}")
            with st.expander(f'Expand loaded game log for game {game_id}:'):
                st.markdown(f"## Game {game_id}:")
                st.write(read_log_df)
            with st.expander(f'Expand loaded game analysis for game {game_id}:'):
                st.markdown(f"## Game {game_id}:")
                st.write(read_analysis_df)
    


    