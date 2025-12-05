try:
    output = intended_result()
except Exception as e:
    output = "[ERROR] " + str(e)
