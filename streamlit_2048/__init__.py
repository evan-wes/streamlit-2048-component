import os
import streamlit.components.v1 as components

# Create a function _component_func which will call the frontend component when run
_component_func = components.declare_component(
    "streamlit_2048",
    url="http://localhost:3001",  # Fetch frontend component from local webserver
)

# Define a public function for the package,
# which wraps the caller to the frontend code
def st_2048(player_name=''):
    component_value = _component_func(player_name=player_name)
    return component_value