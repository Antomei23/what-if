# Functions to parse the XES file and extract data in a list of dictionaries format 
# which will be then converted and analyzed in a Pandas DataFrame.
import xmltodict
from json import dumps,loads
import pandas as pd
def get_one_event_dict(one_event, case_name, data_types):

    one_event_attri = list(one_event.keys())

    one_event_dict = {}
    for i in data_types:
        if i in one_event_attri:
            if type(one_event[i]) == list:
                for j in one_event[i]:
                    one_event_dict[j['@key']] = j['@value']
            else:
                one_event_dict[one_event[i]['@key']] = one_event[i]['@value']
    one_event_dict['case_name'] = case_name
    return one_event_dict

def gain_one_trace_info(one_trace,data_types):
    # for the attributer
    one_trace_attri = list(one_trace.keys())
    one_trace_attri_dict = {}

    for i in data_types:
        if i in one_trace_attri:
            if type(one_trace[i]) == list:
                for j in one_trace[i]:
                    one_trace_attri_dict[j['@key']] = j['@value']
            else:
                one_trace_attri_dict[one_trace[i]['@key']] = one_trace[i]['@value']

    # for event seq
    one_trace_events = []
    if type(one_trace['event']) == dict:
        one_trace['event'] = [one_trace['event']]

    for i in one_trace['event']:
        inter_event = get_one_event_dict(i, one_trace_attri_dict['concept:name'],data_types)
        one_trace_events.append(inter_event)

    return one_trace_attri_dict,one_trace_events

def gain_log_info_table(xml_string):
    data_types = ['string', 'int', 'date', 'float', 'boolean', 'id']

    log_is = xmltodict.parse(xml_string)
    log_is = loads(dumps(log_is))

    traces = log_is['log']['trace']

    trace_attri = []
    trace_event = []
    j = 0
    for i in traces:
        inter = gain_one_trace_info(i,data_types)
        trace_attri.append(inter[0])
        trace_event = trace_event + inter[1]
        j = j +1
        #print(j)
    return trace_attri, trace_event

# function to modify some parameters in the simulation 
def simulate_what_if(df, time_reduction=None, cost_multiplier=None, resource_changes=None):
    """
    Args:
        df (pd.DataFrame): Il DataFrame originale.
        time_reduction (dict): {'activity_name': percentuale_riduzione_tempo (0.2 per -20%)}
        cost_multiplier (dict): {'activity_name': moltiplicatore_costo (1.5 per +50%)}
        resource_changes (dict): {'activity_name': 'nuova_risorsa'}

    Returns:
        pd.DataFrame: DataFrame aggiornato con modifiche applicate.
        dict: Report delle metriche aggregate.
    """
    return None