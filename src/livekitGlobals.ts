/**
 * EduSphere — src/livekitGlobals.ts
 * -----------------------------------------------------------------------
 * Registers WebRTC globals (RTCPeerConnection, MediaStream, etc.) that
 * LiveKit's Room needs. Must run before anything else touches WebRTC —
 * a plain `registerGlobals()` call inside index.ts wouldn't actually run
 * first, since ES module import declarations are hoisted and evaluated
 * before any of a module's own top-level statements, regardless of
 * where the call is textually placed. Importing this as index.ts's
 * first import (a side-effect-only import) guarantees it runs before
 * `./App` and its transitive imports are evaluated.
 * -----------------------------------------------------------------------
 */

import { registerGlobals } from '@livekit/react-native';

registerGlobals();
