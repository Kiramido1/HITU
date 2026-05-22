"""
Async Ollama HTTP Client for HITU AI Platform.

Provides a lightweight async client for the Ollama REST API,
supporting text generation, model health checks, and streaming.
"""
import asyncio
import json
import logging
from typing import AsyncIterator, Dict, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Default timeout for generation requests (seconds)
_GENERATE_TIMEOUT = 120.0
_HEALTH_TIMEOUT = 10.0


class OllamaClient:
    """Async HTTP client for the Ollama local LLM runtime."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.base_url = (base_url or settings.OLLAMA_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL

    # ── Health & Connectivity ───────────────────────────────────────────

    async def is_healthy(self) -> bool:
        """Check if Ollama is reachable and has the configured model."""
        try:
            async with httpx.AsyncClient(timeout=_HEALTH_TIMEOUT) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                resp.raise_for_status()
                data = resp.json()
                model_names = [
                    m.get("name", "") for m in data.get("models", [])
                ]
                # Check if our model (or a prefix of it) is available
                return any(
                    self.model in name or name.startswith(self.model.split(":")[0])
                    for name in model_names
                )
        except Exception as exc:
            logger.warning("Ollama health check failed: %s", exc)
            return False

    async def get_models(self) -> list:
        """List all models available in the local Ollama instance."""
        try:
            async with httpx.AsyncClient(timeout=_HEALTH_TIMEOUT) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                resp.raise_for_status()
                return resp.json().get("models", [])
        except Exception as exc:
            logger.warning("Failed to list Ollama models: %s", exc)
            return []

    # ── Text Generation ─────────────────────────────────────────────────

    async def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
        timeout: float = _GENERATE_TIMEOUT,
    ) -> str:
        """
        Send a prompt to Ollama and return the full response text.

        Args:
            prompt: The user prompt / question.
            system: Optional system-level instruction.
            temperature: Sampling temperature (lower = more deterministic).
            max_tokens: Maximum tokens to generate.
            timeout: Request timeout in seconds.

        Returns:
            The generated text response.

        Raises:
            OllamaError: If the request fails or times out.
        """
        payload: Dict = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        if system:
            payload["system"] = system

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("response", "")
        except httpx.TimeoutException:
            raise OllamaError(
                f"Ollama request timed out after {timeout}s. "
                "Consider increasing the timeout or simplifying the prompt."
            )
        except httpx.HTTPStatusError as exc:
            raise OllamaError(
                f"Ollama returned HTTP {exc.response.status_code}: "
                f"{exc.response.text[:200]}"
            )
        except Exception as exc:
            raise OllamaError(f"Ollama request failed: {exc}")

    async def generate_stream(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
        timeout: float = _GENERATE_TIMEOUT,
    ) -> AsyncIterator[str]:
        """
        Stream tokens from Ollama as they are generated.

        Yields:
            Individual text chunks as they arrive.
        """
        payload: Dict = {
            "model": self.model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        if system:
            payload["system"] = system

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/generate",
                    json=payload,
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if line.strip():
                            chunk = json.loads(line)
                            token = chunk.get("response", "")
                            if token:
                                yield token
                            if chunk.get("done", False):
                                return
        except Exception as exc:
            raise OllamaError(f"Ollama streaming failed: {exc}")

    async def chat(
        self,
        messages: list,
        *,
        temperature: float = 0.3,
        max_tokens: int = 2048,
        timeout: float = _GENERATE_TIMEOUT,
    ) -> str:
        """
        Send a chat-style conversation to Ollama.

        Args:
            messages: List of {"role": "system"|"user"|"assistant", "content": "..."}.
            temperature: Sampling temperature.
            max_tokens: Maximum tokens to generate.
            timeout: Request timeout.

        Returns:
            The assistant's reply text.
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("message", {}).get("content", "")
        except httpx.TimeoutException:
            raise OllamaError(f"Ollama chat timed out after {timeout}s.")
        except Exception as exc:
            raise OllamaError(f"Ollama chat failed: {exc}")


class OllamaError(Exception):
    """Raised when an Ollama API call fails."""
    pass
