#!/usr/bin/env python3
"""
make_jwks.py — generate an RSA keypair and a matching JWKS for AppSec testing
(JKU injection, algorithm confusion, JWKS-spoofing labs).

Outputs (into --outdir, default current dir):
  priv.pem   PKCS#8 private key   (sign forged tokens with this)
  pub.pem    SPKI public key      (e.g. for RS256->HS256 confusion)
  jwks.json  JWK Set with one key (host this at your jku URL)

Dependency:  pip install cryptography

Examples:
  python3 make_jwks.py
  python3 make_jwks.py --kid key-1 --bits 2048 --outdir ./lab
  python3 make_jwks.py --kid $(uuidgen)
"""
import argparse
import base64
import json
import sys
from pathlib import Path


def b64url_uint(value: int) -> str:
    """Encode a non-negative integer as unpadded base64url (RFC 7518 §6.3.1)."""
    length = (value.bit_length() + 7) // 8 or 1
    raw = value.to_bytes(length, "big")
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def main() -> int:
    p = argparse.ArgumentParser(description="Generate RSA keypair + JWKS for JWT testing.")
    p.add_argument("--kid", default="key-1",
                   help="Key ID; MUST match the kid in your forged token header (default: key-1)")
    p.add_argument("--bits", type=int, default=2048,
                   help="RSA key size in bits (default: 2048)")
    p.add_argument("--alg", default="RS256",
                   help="alg advertised in the JWK (default: RS256)")
    p.add_argument("--outdir", default=".",
                   help="Output directory (default: current dir)")
    args = p.parse_args()

    try:
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
    except ImportError:
        sys.stderr.write("Missing dependency. Run:  pip install cryptography\n")
        return 1

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    # 1. Generate the keypair
    priv = rsa.generate_private_key(public_exponent=65537, key_size=args.bits)
    pub = priv.public_key()

    # 2. Write PEMs
    priv_pem = priv.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    pub_pem = pub.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    priv_path = outdir / "priv.pem"
    pub_path = outdir / "pub.pem"
    priv_path.write_bytes(priv_pem)
    pub_path.write_bytes(pub_pem)

    # 3. Build the JWKS straight from the public numbers
    numbers = pub.public_numbers()
    jwk = {
        "kty": "RSA",
        "use": "sig",
        "alg": args.alg,
        "kid": args.kid,
        "n": b64url_uint(numbers.n),
        "e": b64url_uint(numbers.e),
    }
    jwks = {"keys": [jwk]}
    jwks_path = outdir / "jwks.json"
    jwks_path.write_text(json.dumps(jwks, indent=2) + "\n")

    # 4. Report
    print(f"[+] private key : {priv_path}")
    print(f"[+] public  key : {pub_path}")
    print(f"[+] JWKS        : {jwks_path}")
    print(f"[+] kid         : {args.kid}")
    print("\nJWKS contents:")
    print(json.dumps(jwks, indent=2))
    print(
        "\nNext: host jwks.json at your jku URL, then sign with priv.pem,\n"
        f"setting the token header kid to '{args.kid}'."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
