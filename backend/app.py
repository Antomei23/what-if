from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import traceback
from functions import gain_log_info_table

app = Flask(__name__)
CORS(app)

@app.route('/upload-xes/', methods=['POST'])
def upload_xes():
    file = request.files.get('file')

    if not file or not file.filename.endswith(".xes"):
        return jsonify({"error": "Invalid or missing XES file."}), 400

    try:
        xml_string = file.read().decode("utf-8")
        trace_attri, trace_events = gain_log_info_table(xml_string)

        df = pd.DataFrame(trace_events)

        if 'concept:name' not in df.columns:
            return jsonify({"error": "Missing 'concept:name' column in data."}), 400

        timestamp_col = None
        if 'time:timestamp' in df.columns:
            timestamp_col = 'time:timestamp'
        elif 'timestamp' in df.columns:
            timestamp_col = 'timestamp'
        else:
            return jsonify({"error": "Missing timestamp field in data."}), 400

        df[timestamp_col] = pd.to_datetime(df[timestamp_col], errors='coerce')
        df = df.dropna(subset=[timestamp_col])
        df['timestamp'] = df[timestamp_col]

        # Conversione costi a numerico se presenti
        for col in ['fixedCost', 'resourceCost']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        df['activity'] = df['concept:name']

        # Analisi
        node_type_count = df.groupby('nodeType').size().reset_index(name='count') if 'nodeType' in df.columns else []
        events_over_time = df.groupby('timestamp').size().reset_index(name='count')

        case_duration = df.groupby('traceId').agg(start_time=('timestamp', 'min'), end_time=('timestamp', 'max')).reset_index()
        case_duration['duration'] = (case_duration['end_time'] - case_duration['start_time']).dt.total_seconds()

        cost_summary_activity = df.groupby('activity').agg(
            total_fixed_cost=('fixedCost', 'sum'),
            total_resource_cost=('resourceCost', 'sum')
        ).reset_index()
        cost_summary_activity['total_cost'] = cost_summary_activity['total_fixed_cost'] + cost_summary_activity['total_resource_cost']

        return jsonify({
            "nodeTypeCounts": node_type_count if isinstance(node_type_count, list) else node_type_count.to_dict(orient="records"),
            "eventsOverTime": events_over_time.to_dict(orient="records"),
            "caseDurations": case_duration.to_dict(orient="records"),
            "costsByActivity": cost_summary_activity.to_dict(orient="records")
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)
