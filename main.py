import tkinter as tk
from tkinter import ttk

# Truck data dictionary
truck_data = {
    'FH-E': {
        "make": "Volvo",
        "model": "FH",
        "engine": "Euro 6 step",
        "horsepower": 500,
        "torque": 2000,
        'type': 'Electric'
    },
    "FH": {
        "make": "Volvo",
        "model": "FH",
        "engine": "D13TC",
        "horsepower": 660,
        "torque": 1500,
        'type': 'Diesel'
    },
    'FH-GAS':{
        "make": "Volvo",
        "model": "FH",
        "engine": "D13TC",
        "horsepower": 500,
        "torque": 2000,
        'type': 'Natural Gas'
    },
    'VNR400':{
        "make": "Volvo",
        "model": "VNR400",
        "engine": "D11 or D13",
        "horsepower": 500,
        "torque": 2000,
        'type': 'Diesel'
    },
    'VNL':{
        "make": "Volvo",
        "model": "VNL",
        "engine": "Cummins ISX15",
        "horsepower": 425,
        "torque": 2000,
        'type': 'Diesel'
    },
    'VHD':{
        "make": "Volvo",
        "model": "VHD",
        "engine": "D13",
        "horsepower": 500,
        "torque": 2000,
        'type': 'Diesel'
    },
    'FL':{
        "make": "Volvo",
        "model": "FL",
        "engine": "D6B",
        "horsepower": 250,
        "torque": 2000,
        'type': 'Diesel'
    },
    'FE':{
        "make": "Volvo",
        "model": "FE",
        "engine": "6-cylinder D8 engine",
        "horsepower": 536,
        "torque": 2000,
        'type': 'Diesel'
    },
    'FM':{
        "make": "Volvo",
        "model": "FM",
        "engine": "D11K and D13K",
        "horsepower": 460,
        "torque": 2000,
        'type': 'Diesel'
    },
    'FMX':{
        "make": "Volvo",
        "model": "FMX",
        "engine": "D11 step  E",
        "horsepower": 540,
        "torque": 2000,
        'type': 'Diesel'
    }
}

def get_truck_info():
    truck_id = truck_entry.get()
    info_type = info_var.get()

    if truck_id in truck_data:
        if info_type in truck_data[truck_id]:
            result_label.config(text=truck_data[truck_id][info_type], foreground="black")
        else:
            result_label.config(text="Invalid information type", foreground="red")
    else:
        result_label.config(text=f"No data found for {truck_id}", foreground="red")

# Create the main window
root = tk.Tk()
root.title("Volvo Truck Database")
root.geometry("400x300")
root.configure(bg="#EFEFEF")  # Background color

# Create and place widgets with styling
style = ttk.Style()
style.configure("TLabel", font=("Helvetica", 12), background="#EFEFEF")
style.configure("TButton", font=("Helvetica", 12))

# Header Label
header_label = ttk.Label(root, text="Volvo Truck Database", font=("Helvetica", 16, "bold"), background="#EFEFEF")
header_label.pack(pady=10)

truck_label = ttk.Label(root, text="Truck ID:", background="#EFEFEF")
truck_label.pack(pady=5)

truck_entry = ttk.Entry(root)
truck_entry.pack(pady=5)

info_label = ttk.Label(root, text="Information type:", background="#EFEFEF")
info_label.pack(pady=5)

info_var = tk.StringVar()
info_var.set("make")  # Default information type

info_menu = ttk.Combobox(root, textvariable=info_var, values=("make", "model", "engine", "horsepower", "torque", "type"))
info_menu.pack(pady=5)

get_info_button = ttk.Button(root, text="Get Information", command=get_truck_info)
get_info_button.pack(pady=10)

result_label = ttk.Label(root, text="", font=("Helvetica", 12, "italic"), background="#EFEFEF")
result_label.pack(pady=10)

# Start the Tkinter event loop
root.mainloop()
