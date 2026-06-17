 if (!selection.hasRequestSelection()) {
        logging().logToOutput("no request selection — highlight the base64url text first");
        return;
    }

    var selected = selection.requestSelection().contents().toString().trim();
    if (selected.isEmpty()) {
        logging().logToOutput("selection is empty");
        return;
    }

    // --- Attempt 1: base64url (RFC 4648 §5: - and _ alphabet, no padding required) ---
    String decoded = null;
    String tag     = null;

    try {
        var bytes  = java.util.Base64.getUrlDecoder().decode(selected);
        decoded    = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        tag        = "base64url";
        logging().logToOutput("decoded as base64url: " + decoded);
    } catch (IllegalArgumentException e1) {
        logging().logToOutput("not valid base64url, trying standard base64...");

        // --- Attempt 2: standard base64 (+ and / alphabet) ---
        try {
            // Strip any whitespace Burp may have included at selection edges.
            var cleaned = selected.replaceAll("\\s", "");
            var bytes   = java.util.Base64.getDecoder().decode(cleaned);
            decoded     = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            tag         = "base64";
            logging().logToOutput("decoded as base64: " + decoded);
        } catch (IllegalArgumentException e2) {
            logging().logToError(
                "selection is not valid base64url or base64: " + selected, null
            );
            return;
        }
    }

    // --- Splice the tagged result back into the request at the selection offsets ---
    var replacement = "<@" + tag + ">" + decoded + "</@" + tag + ">";

    int start  = selection.requestSelection().offsets().startIndexInclusive();
    int end    = selection.requestSelection().offsets().endIndexExclusive();
    var reqStr = requestResponse.request().toString();

    httpEditor.requestPane().set(
        reqStr.substring(0, start) + replacement + reqStr.substring(end)
    );
    logging().logToOutput("replaced selection with: " + replacement);
