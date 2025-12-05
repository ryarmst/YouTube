import subprocess

RADAMSA_CMD = "radamsa"  # change if needed

def fuzz_with_radamsa(data_bytes, seed_value):
    cmd = [RADAMSA_CMD, "-n", "1"]
    if seed_value is not None:
        cmd.extend(["-s", str(seed_value)])

    p = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, _ = p.communicate(data_bytes)
    return stdout.decode("latin-1")

payload = input

payload_bytes = payload.encode("utf-8")

seed_value = int(seed)

output = fuzz_with_radamsa(payload_bytes, seed_value)
