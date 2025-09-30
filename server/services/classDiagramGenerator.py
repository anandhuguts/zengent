#!/usr/bin/env python3
import json
import sys
from graphviz import Digraph
from typing import Dict, List, Any

def create_class_diagram(analysis_data: Dict[str, Any], output_format: str = 'svg', theme: str = 'light') -> str:
    """
    Generate a UML class diagram from analysis data using Graphviz.
    
    Args:
        analysis_data: Dictionary containing classes and relationships
        output_format: Output format ('svg', 'png', 'pdf')
        theme: Color theme ('light' or 'dark')
    
    Returns:
        Path to the generated diagram file
    """
    
    # Create a new directed graph for UML
    dot = Digraph(comment='UML Class Diagram', format=output_format)
    dot.attr(rankdir='TB', splines='ortho', nodesep='0.8', ranksep='1.2')
    
    # Set theme colors
    if theme == 'dark':
        dot.attr('graph', bgcolor='#1a1a1a', fontcolor='#ffffff')
        dot.attr('node', fontcolor='#ffffff', color='#666666')
        dot.attr('edge', fontcolor='#ffffff', color='#666666')
    else:
        dot.attr('graph', bgcolor='white')
    
    # Color mapping for different class types
    colors = {
        'controller': {'fill': '#e3f2fd', 'border': '#1976d2'},
        'service': {'fill': '#f3e5f5', 'border': '#7b1fa2'},
        'repository': {'fill': '#e8f5e9', 'border': '#388e3c'},
        'entity': {'fill': '#fff3e0', 'border': '#f57c00'},
        'component': {'fill': '#fce4ec', 'border': '#c2185b'},
        'config': {'fill': '#e0f2f1', 'border': '#00796b'},
        'model': {'fill': '#f1f8e9', 'border': '#689f38'},
        'default': {'fill': '#f5f5f5', 'border': '#616161'}
    }
    
    # Process classes
    classes = analysis_data.get('classes', [])
    
    for cls in classes:
        class_name = cls.get('name', 'Unknown')
        class_type = cls.get('type', 'default')
        annotations = cls.get('annotations', [])
        methods = cls.get('methods', [])
        fields = cls.get('fields', [])
        
        # Get color for this class type
        color_scheme = colors.get(class_type, colors['default'])
        
        # Build UML class structure
        label_parts = []
        
        # Stereotype and class name
        stereotype = f'«{class_type}»' if class_type else ''
        label_parts.append(f'<TR><TD BGCOLOR="{color_scheme["border"]}" COLOR="white"><FONT COLOR="white"><B>{stereotype}</B></FONT></TD></TR>')
        label_parts.append(f'<TR><TD><B>{class_name}</B></TD></TR>')
        
        # Add separator
        label_parts.append('<TR><TD><HR/></TD></TR>')
        
        # Fields section
        if fields:
            for field in fields[:8]:  # Limit to 8 fields
                field_name = field.get('name', '')
                field_type = field.get('type', '')
                field_label = f'- {field_name}: {field_type}'
                label_parts.append(f'<TR><TD ALIGN="LEFT">{field_label}</TD></TR>')
            if len(fields) > 8:
                label_parts.append(f'<TR><TD ALIGN="LEFT"><I>... and {len(fields) - 8} more fields</I></TD></TR>')
        
        # Add separator
        label_parts.append('<TR><TD><HR/></TD></TR>')
        
        # Methods section
        if methods:
            for method in methods[:8]:  # Limit to 8 methods
                method_name = method.get('name', '')
                method_label = f'+ {method_name}()'
                label_parts.append(f'<TR><TD ALIGN="LEFT">{method_label}</TD></TR>')
            if len(methods) > 8:
                label_parts.append(f'<TR><TD ALIGN="LEFT"><I>... and {len(methods) - 8} more methods</I></TD></TR>')
        
        # Create the HTML label
        html_label = f'<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4" BGCOLOR="{color_scheme["fill"]}">{"".join(label_parts)}</TABLE>>'
        
        # Add node to graph
        dot.node(class_name, label=html_label, shape='none', 
                style='filled', fillcolor=color_scheme['fill'],
                color=color_scheme['border'], penwidth='2')
    
    # Process relationships
    relationships = analysis_data.get('relationships', [])
    
    # Edge styles for different relationship types
    edge_styles = {
        'extends': {'arrowhead': 'empty', 'style': 'solid', 'color': '#1976d2', 'penwidth': '2'},
        'implements': {'arrowhead': 'empty', 'style': 'dashed', 'color': '#388e3c', 'penwidth': '2'},
        'calls': {'arrowhead': 'open', 'style': 'solid', 'color': '#f57c00', 'penwidth': '1.5'},
        'uses': {'arrowhead': 'open', 'style': 'dashed', 'color': '#7b1fa2', 'penwidth': '1.5'},
        'depends': {'arrowhead': 'open', 'style': 'solid', 'color': '#666666', 'penwidth': '1'}
    }
    
    # Create set of valid class names
    class_names = {cls.get('name') for cls in classes}
    
    for rel in relationships:
        from_class = rel.get('from', '')
        to_class = rel.get('to', '')
        rel_type = rel.get('type', 'depends')
        
        # Only add edges for existing nodes
        if from_class in class_names and to_class in class_names:
            style = edge_styles.get(rel_type, edge_styles['depends'])
            dot.edge(from_class, to_class, label=rel_type, **style)
    
    # Generate the diagram
    output_file = f'/tmp/class_diagram'
    dot.render(output_file, format=output_format, cleanup=True)
    
    return f'{output_file}.{output_format}'

if __name__ == '__main__':
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    
    analysis_data = input_data.get('analysisData', {})
    output_format = input_data.get('format', 'svg')
    theme = input_data.get('theme', 'light')
    
    try:
        output_path = create_class_diagram(analysis_data, output_format, theme)
        print(json.dumps({'success': True, 'path': output_path}))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)
