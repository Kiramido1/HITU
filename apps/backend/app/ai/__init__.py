"""
HITU AI Module — LLM-assisted scheduling intelligence.

Current AI scheduling uses Google OR-Tools in services/scheduler.py.
This module provides LLM-powered analysis and recommendations via Ollama:
- Pre-schedule constraint analysis
- Optimization strategy recommendations
- Schedule explanation in natural language
- Infeasibility diagnosis and fix suggestions
"""

from app.ai.ollama_client import OllamaClient, OllamaError
from app.ai.scheduling_assistant import SchedulingAssistant

__all__ = [
    "OllamaClient",
    "OllamaError",
    "SchedulingAssistant",
]
