import re
from datetime import datetime, timedelta

def calculate_work_hours_per_day(file_path):
    # Read the content of the file
    with open(file_path, 'r') as file:
        text = file.read()

    # Regular expression to match the start and terminated lines
    time_pattern = re.compile(r"(start|terminated):\n(Mon|Tue|Wed|Thu|Fri|Sat|Sun) ([A-Za-z]+) (\d+) (\d+):(\d+):(\d+) CET (\d+)")

    # Parse the text and extract times
    times = time_pattern.findall(text)
    if not times:
        raise ValueError("No valid start or termination times found.")

    work_sessions = {}
    start_time = None
    last_tag = None
    print(times)
    for tag, _, month, day, hour, minute, second, year in times:
        time_str = f"{year}-{month}-{day} {hour}:{minute}:{second}"
        current_time = datetime.strptime(time_str, "%Y-%b-%d %H:%M:%S")

        date_key = current_time.date()

        if tag == "start":
            if last_tag == "start":
                raise ValueError("Multiple consecutive start times found.")
            start_time = current_time
        else:
            if last_tag == "terminated" or last_tag is None or start_time is None:
                raise ValueError("Multiple consecutive termination times found.")
            duration = current_time - start_time
            work_sessions[date_key] = work_sessions.get(date_key, timedelta()) + duration
            start_time = None
        
        last_tag = tag

    if start_time is not None:
        raise ValueError("Unmatched start time without termination.")

    return {date: (duration.total_seconds() // 3600, (duration.total_seconds() % 3600) // 60) for date, duration in work_sessions.items()}

# Example usage
file_path = "global_counter.txt"

try:
    work_hours_per_day = calculate_work_hours_per_day(file_path)
    for date, (hours, minutes) in work_hours_per_day.items():
        print(f"{date}: {hours} hours, {minutes} minutes")
except ValueError as e:
    print(e)

