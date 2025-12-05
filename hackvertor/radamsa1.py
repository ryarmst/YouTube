import subprocess

# Change this if radamsa isn't on your PATH
RADAMSA_CMD = "radamsa"

def fuzz_with_radamsa(data):
    p = subprocess.Popen(
        [RADAMSA_CMD, "-n", "1"],   # one mutated sample
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = p.communicate(data)
    if stdout:
        # Decode as latin-1 so every byte maps 1:1 into a string
        return stdout.decode("latin-1")
    else:
        return data

payload = input
payload_bytes = payload.encode("utf-8")

output = fuzz_with_radamsa(payload_bytes)
