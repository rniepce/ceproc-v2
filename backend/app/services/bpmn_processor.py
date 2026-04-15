"""BPMN Processing service for JSON to XML conversion."""
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class BPMNProcessor:
    """Process BPMN JSON and convert to BPMN 2.0 XML."""

    BPMN_NAMESPACE = "http://www.omg.org/spec/BPMN/20100524/MODEL"
    BPMNDI_NAMESPACE = "http://www.omg.org/spec/BPMN/20100524/DI"
    OMGDC_NAMESPACE = "http://www.omg.org/spec/DD/20100524/DC"
    OMGDI_NAMESPACE = "http://www.omg.org/spec/DD/20100524/DI"

    def __init__(self):
        """Initialize BPMN processor."""
        self.process_id = None
        self.elements = {}
        self.flows = []

    def convert_json_to_xml(self, bpmn_json: dict) -> str:
        """
        Convert BPMN JSON structure to BPMN 2.0 XML.

        Args:
            bpmn_json: BPMN structure from LLM with pools, lanes, activities, etc.

        Returns:
            BPMN 2.0 XML string
        """
        logger.info("Starting BPMN JSON to XML conversion")

        try:
            self.process_id = f"Process_{uuid.uuid4().hex[:8]}"

            # Build XML structure
            xml_parts = [self._get_xml_declaration()]

            # Root definitions element
            xml_parts.append(self._build_definitions(bpmn_json))

            xml_str = "\n".join(xml_parts)
            logger.info("BPMN XML conversion completed successfully")
            return xml_str

        except Exception as e:
            logger.error(f"Error converting BPMN JSON to XML: {str(e)}")
            raise

    def _get_xml_declaration(self) -> str:
        """Get XML declaration header."""
        return '<?xml version="1.0" encoding="UTF-8"?>'

    def _build_definitions(self, bpmn_json: dict) -> str:
        """Build definitions root element."""
        definitions_id = f"Definitions_{uuid.uuid4().hex[:8]}"
        namespace_attrs = (
            f' xmlns="{self.BPMN_NAMESPACE}"'
            f' xmlns:bpmndi="{self.BPMNDI_NAMESPACE}"'
            f' xmlns:omgdc="{self.OMGDC_NAMESPACE}"'
            f' xmlns:omgdi="{self.OMGDI_NAMESPACE}"'
            f' id="{definitions_id}"'
            f' targetNamespace="{self.BPMN_NAMESPACE}"'
        )

        process_xml = self._build_process(bpmn_json)
        diagram_xml = self._build_diagram(bpmn_json)

        return (
            f"<definitions{namespace_attrs}>"
            f"{process_xml}"
            f"{diagram_xml}"
            f"</definitions>"
        )

    def _build_process(self, bpmn_json: dict) -> str:
        """Build process element with all activities and flows."""
        process_parts = [
            f'<process id="{self.process_id}" isExecutable="false">'
        ]

        # Add pools as lanes in collaboration
        lanes_xml = self._build_lanes(bpmn_json.get("pools", []))
        process_parts.append(lanes_xml)

        # Add start event
        start_event = bpmn_json.get("startEvent", {})
        if start_event:
            process_parts.append(self._build_start_event(start_event))

        # Add activities
        activities = bpmn_json.get("activities", [])
        for activity in activities:
            process_parts.append(self._build_activity(activity))

        # Add gateways
        gateways = bpmn_json.get("gateways", [])
        for gateway in gateways:
            process_parts.append(self._build_gateway(gateway))

        # Add end event
        end_event = bpmn_json.get("endEvent", {})
        if end_event:
            process_parts.append(self._build_end_event(end_event))

        # Add sequence flows
        flows = bpmn_json.get("sequenceFlows", [])
        for flow in flows:
            process_parts.append(self._build_sequence_flow(flow))

        process_parts.append("</process>")

        return "\n".join(process_parts)

    def _build_lanes(self, pools: List[dict]) -> str:
        """Build lane set with lanes for each pool."""
        if not pools:
            return ""

        lane_set_parts = ['<laneSet id="LaneSet_1">']

        for pool in pools:
            lane_id = pool.get("id", f"Lane_{uuid.uuid4().hex[:8]}")
            lane_name = pool.get("name", "")
            lane_name_attr = f' name="{lane_name}"' if lane_name else ""

            lane_parts = [
                f'<lane id="{lane_id}"{lane_name_attr}>',
                f'<flowNodeRef>{self.process_id}</flowNodeRef>',
                '</lane>'
            ]
            lane_set_parts.extend(lane_parts)

        lane_set_parts.append("</laneSet>")

        return "\n".join(lane_set_parts)

    def _build_start_event(self, start_event: dict) -> str:
        """Build start event element."""
        event_id = start_event.get("id", f"StartEvent_{uuid.uuid4().hex[:8]}")
        event_name = start_event.get("name", "")
        name_attr = f' name="{event_name}"' if event_name else ""

        return f'<startEvent id="{event_id}"{name_attr}><outgoing>{event_id}_out</outgoing></startEvent>'

    def _build_activity(self, activity: dict) -> str:
        """Build activity (task) element."""
        activity_id = activity.get("id", f"Activity_{uuid.uuid4().hex[:8]}")
        activity_name = activity.get("name", "")
        activity_type = activity.get("type", "task")
        name_attr = f' name="{activity_name}"' if activity_name else ""

        incoming = activity.get("incoming", [])
        outgoing = activity.get("outgoing", [])

        parts = [f'<task id="{activity_id}"{name_attr}>']

        for inc in incoming:
            parts.append(f'<incoming>{inc}</incoming>')

        for out in outgoing:
            parts.append(f'<outgoing>{out}</outgoing>')

        parts.append('</task>')

        return "\n".join(parts)

    def _build_gateway(self, gateway: dict) -> str:
        """Build gateway element."""
        gateway_id = gateway.get("id", f"Gateway_{uuid.uuid4().hex[:8]}")
        gateway_name = gateway.get("name", "")
        gateway_type = gateway.get("type", "exclusive")
        name_attr = f' name="{gateway_name}"' if gateway_name else ""

        incoming = gateway.get("incoming", [])
        outgoing = gateway.get("outgoing", [])

        # Map gateway types
        gateway_element = "exclusiveGateway" if gateway_type == "exclusive" else "parallelGateway"

        parts = [f'<{gateway_element} id="{gateway_id}"{name_attr}>']

        for inc in incoming:
            parts.append(f'<incoming>{inc}</incoming>')

        for out in outgoing:
            parts.append(f'<outgoing>{out}</outgoing>')

        parts.append(f'</{gateway_element}>')

        return "\n".join(parts)

    def _build_end_event(self, end_event: dict) -> str:
        """Build end event element."""
        event_id = end_event.get("id", f"EndEvent_{uuid.uuid4().hex[:8]}")
        event_name = end_event.get("name", "")
        name_attr = f' name="{event_name}"' if event_name else ""

        incoming = end_event.get("incoming", [])

        parts = [f'<endEvent id="{event_id}"{name_attr}>']

        for inc in incoming:
            parts.append(f'<incoming>{inc}</incoming>')

        parts.append('</endEvent>')

        return "\n".join(parts)

    def _build_sequence_flow(self, flow: dict) -> str:
        """Build sequence flow element."""
        flow_id = flow.get("id", f"Flow_{uuid.uuid4().hex[:8]}")
        source = flow.get("source", "")
        target = flow.get("target", "")
        flow_name = flow.get("name", "")
        name_attr = f' name="{flow_name}"' if flow_name else ""

        if not source or not target:
            logger.warning(f"Skipping flow {flow_id}: missing source or target")
            return ""

        return f'<sequenceFlow id="{flow_id}" sourceRef="{source}" targetRef="{target}"{name_attr} />'

    def _build_diagram(self, bpmn_json: dict) -> str:
        """Build BPMNDI diagram element."""
        diagram_id = f"Diagram_{uuid.uuid4().hex[:8]}"
        plane_id = f"Plane_{uuid.uuid4().hex[:8]}"

        diagram_parts = [
            f'<bpmndi:BPMNDiagram id="{diagram_id}">',
            f'<bpmndi:BPMNPlane id="{plane_id}" bpmnElement="{self.process_id}">',
        ]

        # Add shape elements for all flow nodes
        all_nodes = (
            [bpmn_json.get("startEvent", {})] if bpmn_json.get("startEvent") else []
        )
        all_nodes.extend(bpmn_json.get("activities", []))
        all_nodes.extend(bpmn_json.get("gateways", []))
        all_nodes.extend(
            [bpmn_json.get("endEvent", {})] if bpmn_json.get("endEvent") else []
        )

        for node in all_nodes:
            if node:
                shape_xml = self._build_shape(node)
                diagram_parts.append(shape_xml)

        # Add edge elements for flows
        for flow in bpmn_json.get("sequenceFlows", []):
            edge_xml = self._build_edge(flow)
            diagram_parts.append(edge_xml)

        diagram_parts.append("</bpmndi:BPMNPlane>")
        diagram_parts.append("</bpmndi:BPMNDiagram>")

        return "\n".join(diagram_parts)

    def _build_shape(self, node: dict) -> str:
        """Build shape element for a node."""
        node_id = node.get("id", "")
        if not node_id:
            return ""

        bounds = node.get("bounds", {"x": 100, "y": 100, "width": 100, "height": 80})
        x = bounds.get("x", 100)
        y = bounds.get("y", 100)
        width = bounds.get("width", 100)
        height = bounds.get("height", 80)

        return (
            f'<bpmndi:BPMNShape id="{node_id}_Shape" bpmnElement="{node_id}">'
            f'<omgdc:Bounds x="{x}" y="{y}" width="{width}" height="{height}" />'
            f'</bpmndi:BPMNShape>'
        )

    def _build_edge(self, flow: dict) -> str:
        """Build edge element for a sequence flow."""
        flow_id = flow.get("id", "")
        waypoints = flow.get("waypoints", [])

        if not flow_id or not waypoints:
            return ""

        edge_parts = [
            f'<bpmndi:BPMNEdge id="{flow_id}_Edge" bpmnElement="{flow_id}">'
        ]

        for wp in waypoints:
            x = wp.get("x", 0)
            y = wp.get("y", 0)
            edge_parts.append(f'<omgdi:waypoint x="{x}" y="{y}" />')

        edge_parts.append("</bpmndi:BPMNEdge>")

        return "\n".join(edge_parts)

    def inject_waypoints(self, bpmn_json: dict, waypoints_map: Dict[str, List[Tuple[int, int]]]) -> dict:
        """
        Inject waypoints into sequence flows for better visualization.

        Args:
            bpmn_json: Original BPMN JSON
            waypoints_map: Mapping of flow_id to list of (x, y) coordinates

        Returns:
            Updated BPMN JSON with waypoints
        """
        for flow in bpmn_json.get("sequenceFlows", []):
            flow_id = flow.get("id")
            if flow_id in waypoints_map:
                waypoint_coords = waypoints_map[flow_id]
                flow["waypoints"] = [
                    {"x": x, "y": y} for x, y in waypoint_coords
                ]

        return bpmn_json

    def validate_bpmn(self, bpmn_json: dict) -> Tuple[bool, List[str]]:
        """
        Validate BPMN structure for common errors.

        Args:
            bpmn_json: BPMN JSON structure

        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []

        # Check for start event
        if not bpmn_json.get("startEvent"):
            errors.append("Missing start event")

        # Check for end event
        if not bpmn_json.get("endEvent"):
            errors.append("Missing end event")

        # Check for activities
        activities = bpmn_json.get("activities", [])
        if not activities:
            errors.append("No activities defined")

        # Check for orphaned nodes
        all_node_ids = set()
        for activity in activities:
            all_node_ids.add(activity.get("id"))
        for gateway in bpmn_json.get("gateways", []):
            all_node_ids.add(gateway.get("id"))

        referenced_ids = set()
        for flow in bpmn_json.get("sequenceFlows", []):
            referenced_ids.add(flow.get("source"))
            referenced_ids.add(flow.get("target"))

        orphaned = all_node_ids - referenced_ids
        if orphaned:
            errors.append(f"Orphaned nodes: {orphaned}")

        # Check for isolated flows (not connected to start or end)
        start_id = bpmn_json.get("startEvent", {}).get("id")
        end_id = bpmn_json.get("endEvent", {}).get("id")

        is_valid = len(errors) == 0

        logger.info(f"BPMN validation: {'PASSED' if is_valid else 'FAILED'}")
        if errors:
            logger.warning(f"Validation errors: {errors}")

        return is_valid, errors


def get_bpmn_processor() -> BPMNProcessor:
    """Get BPMN processor instance."""
    return BPMNProcessor()
