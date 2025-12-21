import socketio
import requests
import time
import os
import sys

# --- Configuration Constants (Cleaned up and Centralized) ---
class Config:
    # Socket.IO connection details
    SERVER_URL = "https://whiteboard.chat42.eu"
    
    # Bad Apple!! frame details
    OFFSET_X = 200       # constant offset for the whole canvas (o)
    OFFSET_Y = 100       # constant offset for the whole canvas (o)
    PIXEL_SIZE_X = 5    # constant pixel size (p)
    PIXEL_SIZE_Y = 8    # constant pixel size (p)
    FPS = 42          # originale frames per second based on the original data
    DELAY_MS = 27    # delay in ms between frames that get drawn (d)
    TOTAL_FRAMES = 6572 # constant, see dataset
    WIDTH = 96        # fixed width (w)
    HEIGHT = 36       # fixed height (h)
    
    # Path to the ASCII frames
    FRAMES_DIR = "frames_ascii"
    FRAME_FILE_PATTERN = "out{frame_num:04d}.jpg.txt"
    
    # Color map for the ASCII characters
    COLOR_MAP = {
        '@': "#FFFFFF",  # Black
        ' ': "#000000",  # White
        # Any other character (like '#', '.', etc.) is treated as gray in the original logic
        # The original logic treats anything that is not '@' or ' ' as gray
        'GRAY': "#888888" 
    }

# --- Socket.IO Client Setup ---
# The Socket.IO connection is established globally/at the start in Python
sio = socketio.Client(reconnection=True)

@sio.event
def connect():
    """Handles successful connection to the Socket.IO server."""
    print("🚀 Connected to Socket.IO server!")

@sio.event
def disconnect():
    """Handles disconnection from the Socket.IO server."""
    print("🛑 Disconnected from Socket.IO server.")

#used to detect anything the serever might want to tell me
@sio.on('*')
def catch_all(event, *args):
    #print(f"--- Incoming Event Detected ---")
    print(f"Event incoming: {event}")
    
    # args is a tuple containing the data payload
    for i, data in enumerate(args):
        print(f"Data Arg {i+1}: {data}")
    #print("-------------------------------")

# --- Utility Functions ---

def get_file_content(frame_number: int) -> str:
    """
    Reads the content of an ASCII frame file from the local filesystem.
    
    In the original JavaScript, this was an XMLHttpRequest to fetch the file
    from a server path. In Python, we assume the frames are local.
    """
    filename = Config.FRAME_FILE_PATTERN.format(frame_num=frame_number)
    filepath = os.path.join(Config.FRAMES_DIR, filename)

    try:
        with open(filepath, 'r') as f:
            content = f.read()
        #print(f"Loaded frame {frame_number} content.")
        return content
    except FileNotFoundError:
        error_msg = f"Error: Frame file not found at {filepath}"
        #print(error_msg, file=sys.stderr)
        return ""
    except Exception as e:
        error_msg = f"Error reading frame file {filepath}: {e}"
        #print(error_msg, file=sys.stderr)
        return ""

def get_delay_in_seconds() -> float:
    """Calculates the delay in seconds from the milliseconds constant."""
    return Config.DELAY_MS / 1000.0

def calculate_frame_increment() -> int:
    """Calculates the number of frames to skip per delay interval."""
    # frameIncrement = parseInt(fps * d / 1000)
    # The original JS used a formula that calculates how many frames would have
    # passed during the delay 'd'. We ensure it's at least 1.
    increment = int(Config.FPS * Config.DELAY_MS / 1000)
    return max(1, increment)


# --- Core Logic ---

def send_frame(frame_number: int, reset: bool):
    """
    Reads an ASCII frame and sends drawing commands to the Socket.IO server.
    """
    
    #print(f"Started on frame {frame_number}")
    
    # 1. Fetch Frame Content
    text_full = get_file_content(frame_number)
    if not text_full:
        #print(f"Skipping frame {frame_number} due to load error.")
        return
        
    text_lines = text_full.split("\n")
    
    # 2. Reset Canvas (if requested)
    if reset:
        sio.emit("resetCanvas", {"clientId": "bad_apple_client_lol"})
        #print("Sent resetCanvas command.")

    # 3. Draw Bad Apple!! Frame
    # The original JS logic groups contiguous pixels of the same color
    # to draw a single line segment, which is more efficient than
    # drawing pixel-by-pixel.

    o_x, o_y, p_x, p_y, w, h = Config.OFFSET_X, Config.OFFSET_Y, Config.PIXEL_SIZE_X, Config.PIXEL_SIZE_Y, Config.WIDTH, Config.HEIGHT

    for i in range(h): # Iterate over lines (y-coordinate)
        if i >= len(text_lines):
            break # Safety break if frame file is shorter than expected
            
        line = text_lines[i] # Get current line
        
        j = 0 # Current character index (x-coordinate)
        
        
            
        
        while j < w:
            start_j = j
            
            # --- State 1: white (@) ---
            if line[j] == '@':
                current_color = Config.COLOR_MAP['@']
                while j < w and line[j] == '@':
                    j += 1
            
            # --- State 2: black ( ) ---
            elif line[j] == ' ':
                current_color = Config.COLOR_MAP[' ']
                while j < w and line[j] == ' ':
                    j += 1
            
            # --- State 3: Gray (Anything else) ---
            else:
                current_color = Config.COLOR_MAP['GRAY']
                # The original JS logic: while not '@' and not ' '
                while j < w and line[j] != '@' and line[j] != ' ':
                    j += 1
            
            # Send drawing command for the contiguous segment
            if j >= start_j:
                x0 = o_x + p_x * start_j
                x1 = o_x + p_x * j
                y0 = o_y + p_y * i
                y1 = o_y + p_y * i
                
                # Note: The original JS used y0 and y1 as the same, suggesting
                # it's drawing a horizontal line segment (rectangle of 1 pixel height).
                sio.emit("drawing", {
                    "x0": x0, 
                    "y0": y0, 
                    "x1": x1, 
                    "y1": y1, 
                    "color": current_color#,
                    #"clientId": "bad_apple_client_lol"
                })
                # #print(f"Sent: {current_color} from {start_j} to {j} on line {i}")
            
            # If no progress was made (shouldn't happen with the logic above, but safety)
            #if j == start_j:
            #    j += 1


def apple(reset: bool):

    """
    Main loop to iterate through frames, send them, and pause.
    """
    
    
    
    #Reset Canvas (if requested)
    if reset:
        sio.emit("resetCanvas", {"clientId": "bad_apple_client_lol"})
        #print("Sent resetCanvas command.")
    
    frame = 1
    frame_increment = calculate_frame_increment()
    delay_sec = get_delay_in_seconds()
    
    print(f"Starting playback: Increment={frame_increment}, Delay={Config.DELAY_MS}ms")
    
    while frame <= Config.TOTAL_FRAMES:
        send_frame(frame, reset)
        
        
        #print(f"Sleeping for {delay_sec} seconds...")
        time.sleep(delay_sec)
        #print("Sleep finished.")
        
        frame += frame_increment

    print("Playback finished.")
    
    # Send a final reset if requested (to clean up after the video ends)
    if reset: # Will only trigger if totalFrames was 0 or loop never ran
        sio.emit("resetCanvas", {"clientId": "bad_apple_client_lol"})
        print("Sent final resetCanvas command.")


def send_bad_apple():
    """Entry point function."""
    print("--- BAD APPLE SCRIPT STARTING ---")
    
    # Attempt to connect to the Socket.IO server
    try:
        sio.connect(Config.SERVER_URL, transports=['websocket'])
    except socketio.exceptions.ConnectionError as e:
        print(f"Failed to connect to {Config.SERVER_URL}: {e}", file=sys.stderr)
        return

    sio.emit('admin-auth', {"code": "19931993", "clientId": "bad_apple_client_lol"})
    # Start the playback loop. The original JS used 'apple(false)'.
    apple(reset=False)
    
    
    # Wait for a moment before disconnecting to ensure last events are sent
    time.sleep(1) 
    
    sio.disconnect()
    print("--- BAD APPLE SCRIPT FINISHED ---")


if __name__ == "__main__":
    # Ensure the frames directory exists before running
    if not os.path.isdir(Config.FRAMES_DIR):
        print(f"Error: Frames directory '{Config.FRAMES_DIR}' not found.", file=sys.stderr)
        print("Please ensure your ASCII frames are in a folder named 'frames_ascii' in the same directory as this script.", file=sys.stderr)
    else:
        send_bad_apple()