"""LLM Service for Azure OpenAI integration."""
import json
import logging
from typing import Optional
from openai import AzureOpenAI
from ..config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with Azure OpenAI."""

    def __init__(self):
        """Initialize Azure OpenAI client."""
        self.client = AzureOpenAI(
            api_key=settings.AZURE_OPENAI_KEY,
            api_version="2024-02-15-preview",
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        )
        self.deployment_name = settings.AZURE_OPENAI_DEPLOYMENT

    def _load_prompt(self, filename: str) -> str:
        """Load a prompt template from file."""
        import os

        prompt_path = os.path.join(
            os.path.dirname(__file__),
            "..",
            "prompts",
            filename
        )
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            logger.error(f"Prompt file not found: {prompt_path}")
            raise

    def extract_dpt(self, interview_text: str, context: Optional[dict] = None) -> dict:
        """
        Extract DPT (Descrição de Processo e Tarefas) from interview text.

        Args:
            interview_text: Raw text from interview or transcription
            context: Optional metadata (client name, date, etc.)

        Returns:
            Validated DPT JSON structure
        """
        logger.info("Starting DPT extraction from interview text")

        prompt_template = self._load_prompt("dpt_extraction.md")

        # Add context if provided
        context_str = ""
        if context:
            context_str = f"\n## Contexto\n{json.dumps(context, indent=2, ensure_ascii=False)}"

        full_prompt = f"{prompt_template}{context_str}\n\n## Texto da Entrevista\n{interview_text}"

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert process analyst. Extract structured information from interviews following the provided schema.",
                    },
                    {
                        "role": "user",
                        "content": full_prompt,
                    }
                ],
                temperature=0.2,  # Lower temperature for consistency
                max_tokens=4000,
            )

            response_text = response.choices[0].message.content

            # Extract JSON from response
            dpt_json = self._extract_json_from_response(response_text)
            logger.info("DPT extraction completed successfully")
            return dpt_json

        except Exception as e:
            logger.error(f"Error in DPT extraction: {str(e)}")
            raise

    def convert_dpt_to_bpmn(self, dpt: dict) -> dict:
        """
        Convert DPT structure to BPMN JSON format with coordinates.

        Args:
            dpt: Validated DPT dictionary

        Returns:
            BPMN JSON structure with waypoints and coordinates
        """
        logger.info("Starting DPT to BPMN conversion")

        prompt_template = self._load_prompt("dpt_to_bpmn_json.md")

        full_prompt = f"{prompt_template}\n\n## DPT Dados\n{json.dumps(dpt, indent=2, ensure_ascii=False)}"

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert in BPMN 2.0 notation. Convert process descriptions to valid BPMN JSON with precise coordinates and waypoints.",
                    },
                    {
                        "role": "user",
                        "content": full_prompt,
                    }
                ],
                temperature=0.1,  # Very low temperature for consistency in coordinates
                max_tokens=5000,
            )

            response_text = response.choices[0].message.content
            bpmn_json = self._extract_json_from_response(response_text)

            logger.info("DPT to BPMN conversion completed successfully")
            return bpmn_json

        except Exception as e:
            logger.error(f"Error in DPT to BPMN conversion: {str(e)}")
            raise

    def generate_kpis(self, dpt: dict, process_name: str = "") -> dict:
        """
        Generate KPI indicators from DPT structure.

        Args:
            dpt: Validated DPT dictionary
            process_name: Optional process name for context

        Returns:
            Dictionary with list of KPI indicators
        """
        logger.info(f"Starting KPI generation for process: {process_name}")

        prompt_template = self._load_prompt("kpi_generation.md")

        context_info = f"Process Name: {process_name}\n" if process_name else ""
        full_prompt = f"{prompt_template}\n\n{context_info}## DPT Dados\n{json.dumps(dpt, indent=2, ensure_ascii=False)}"

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert in KPI definition and business metrics. Generate relevant and measurable KPIs based on process analysis.",
                    },
                    {
                        "role": "user",
                        "content": full_prompt,
                    }
                ],
                temperature=0.3,  # Slightly higher for creativity in KPI suggestion
                max_tokens=4000,
            )

            response_text = response.choices[0].message.content
            kpi_data = self._extract_json_from_response(response_text)

            logger.info(f"KPI generation completed with {len(kpi_data.get('kpis', []))} indicators")
            return kpi_data

        except Exception as e:
            logger.error(f"Error in KPI generation: {str(e)}")
            raise

    def analyze_bottlenecks(self, dpt: dict, bpmn: dict) -> dict:
        """
        Analyze process for bottlenecks and improvement opportunities.

        Args:
            dpt: Validated DPT dictionary
            bpmn: BPMN JSON structure

        Returns:
            Dictionary with bottleneck analysis and recommendations
        """
        logger.info("Starting bottleneck analysis")

        analysis_prompt = """Analyze the following process for bottlenecks and improvement opportunities.

Consider:
1. Long sequential activities that could be parallelized
2. Manual handoffs between systems that could be automated
3. Decision points with unclear criteria
4. Missing or incomplete information flows
5. Potential single points of failure
6. Activities with high manual effort

Return a JSON object with structure:
{
  "bottlenecks": [
    {
      "activity": "activity name",
      "severity": "high|medium|low",
      "description": "description of bottleneck",
      "impact": "estimated impact on cycle time or cost",
      "recommendation": "suggested improvement"
    }
  ],
  "prioritized_improvements": [
    {
      "improvement": "improvement description",
      "effort": "high|medium|low",
      "expectedBenefit": "estimated benefit"
    }
  ]
}"""

        full_prompt = f"{analysis_prompt}\n\n## Processo DPT\n{json.dumps(dpt, indent=2, ensure_ascii=False)}\n\n## BPMN JSON\n{json.dumps(bpmn, indent=2, ensure_ascii=False)}"

        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a process optimization expert. Identify bottlenecks and provide actionable recommendations.",
                    },
                    {
                        "role": "user",
                        "content": full_prompt,
                    }
                ],
                temperature=0.5,
                max_tokens=3000,
            )

            response_text = response.choices[0].message.content
            analysis = self._extract_json_from_response(response_text)

            logger.info("Bottleneck analysis completed")
            return analysis

        except Exception as e:
            logger.error(f"Error in bottleneck analysis: {str(e)}")
            raise

    @staticmethod
    def _extract_json_from_response(response_text: str) -> dict:
        """
        Extract JSON from LLM response, handling markdown code blocks.

        Args:
            response_text: Raw response from LLM

        Returns:
            Parsed JSON dictionary
        """
        # Try to find JSON in code blocks
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            json_str = response_text[start:end].strip()
        elif "```" in response_text:
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            json_str = response_text[start:end].strip()
        else:
            # Try to find raw JSON
            json_str = response_text

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from LLM response: {str(e)}")
            logger.debug(f"Response text: {response_text}")
            raise ValueError(f"Invalid JSON in LLM response: {str(e)}")


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create LLM service singleton."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
