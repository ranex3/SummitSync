from database.db_conf import *
from helper import generate_id
from flask import jsonify
from pytz import timezone

# Need to create a schedule for the conference. Need to make sure things do not clash.

# Need to be able to create a task schedule for volunteers

# Need to be able to share the schedule to others. (Maybe do this via email).

# Need to be able to edit these events as well

def schedule_event_add(request):
    # Get the parameters for conf add
    try:
        params = request.args

        cid = params.get('cid')
        event_name = params.get('event_name')
        date_time_start = params.get('date_time_start')
        date_time_end = params.get('date_time_end')
        description = params.get('description')

        # Check start and end times are not conflicting with existing events
        events = db_conf_event_get_all(cid)

        for event in events:
            # if datetime.strptime(date_time_start, '%m/%d/%y %H:%M:%S').replace(tzinfo=timezone('UTC')) <= event.get('date_time_end') and event.get('date_time_start') <= datetime.strptime(date_time_end, '%m/%d/%y %H:%M:%S').replace(tzinfo=timezone('UTC')):
            #     continue
            # else:
            #     return jsonify({"error": "overlapping times"}), 403
            print('hello')
            startA = datetime.strptime(date_time_start, '%d/%m/%Y %H:%M:%S').replace(tzinfo=timezone('UTC')).timestamp()
            startB = event.get('date_time_start').timestamp()

            endA = datetime.strptime(date_time_end, '%d/%m/%Y %H:%M:%S').replace(tzinfo=timezone('UTC')).timestamp()
            endB = event.get('date_time_end').timestamp()
            if (startA <= endB) and (endA >= startB):
                return jsonify({"error": "overlapping times"}), 403


        # Add in event
        eid = generate_id()

        db_conf_event_add(cid, eid, event_name, datetime.strptime(date_time_start, '%d/%m/%Y %H:%M:%S'), datetime.strptime(date_time_end, '%d/%m/%Y %H:%M:%S'), description)

        return '200'

    except KeyError:

        return '400'

def schedule_event_remove(request):
    try:
        params = request.args

        cid = params.get('cid')
        eid = params.get('eid')

        db_conf_event_delete(cid, eid)

        return '200'
    except KeyError:
        return jsonify({"error": "missing params"}), 400


def schedule_event_get_all(request):
    try:
        params = request.args

        cid = params.get('cid')

        events = db_conf_event_get_all(cid)

        return jsonify(events), '200'
    except KeyError:
        return jsonify({"error": "missing params"}), 400

def schedule_event_get(request):
    try:
        params = request.args

        cid = params.get('cid')
        eid = params.get('eid')

        event = db_conf_event_get(cid, eid)

        return jsonify(event), '200'
    except KeyError:
        return jsonify({"error": "missing params"}), 400


def schedule_event_author_add(request):
    try:
        params = request.args

        cid = params.get('cid')
        eid = params.get('eid')
        name = params.get('name')

        db_conf_event_author_add(cid, eid, name)

        return '200'

    except KeyError:
        return jsonify({"error": "missing params"}), 400

def schedule_event_author_remove(request):
    try:
        params = request.args

        cid = params.get('cid')
        eid = params.get('eid')
        name = params.get('name')

        db_conf_event_author_remove(cid, eid, name)

        return '200'

    except KeyError:
        return jsonify({"error": "missing params"}), 400