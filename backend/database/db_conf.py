from database.db_conn import db
from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from database.db_user import db_user_get

import datetime
from datetime import datetime

conf_coll = db.collection('conferences')

forums_str = 'forums'
posts_str = 'posts'
responses_str = 'responses'
tasks_str = 'tasks'
schedule_str = 'events'
authors_str = 'authors'
attendance_str = 'attendance'

query_direction = direction=firestore.Query.ASCENDING

#################
#### HELPERS ####
#################

def ref_conf_coll_doc(cid):
    return conf_coll.document(cid)

def ref_conf_forum_coll(cid):
    return ref_conf_coll_doc(cid).collection(forums_str)

def ref_conf_forum_post_coll(cid, fid):
    return ref_conf_forum_coll(cid).document(fid).collection(posts_str)

def ref_conf_forum_post_response_coll(cid, fid, pid):
    return ref_conf_forum_post_coll(cid, fid).document(pid).collection(responses_str)

def ref_conf_tasks_coll(cid):
    return ref_conf_coll_doc(cid).collection(tasks_str)

def ref_conf_schedule_coll(cid):
    return ref_conf_coll_doc(cid).collection(schedule_str)

def ref_conf_schedule_event_coll(cid, eid):
    return ref_conf_schedule_coll(cid).collection(schedule_str).document(eid)

def ref_conf_schedule_event_auth_coll(cid, eid):
    return ref_conf_schedule_coll(cid).collection(schedule_str).document(eid).collection(authors_str)

def ref_conf_attendance_coll(cid):
    return ref_conf_coll_doc(cid).collection(attendance_str)

#####################
#### CONFERENCES ####
#####################

def db_conf_add(cid, uid, conf_name, place_id):
    ref_conf_coll_doc(cid).set({
        'cid': cid,
        'name': conf_name,
        'place_id': place_id,
        'organiser': uid,
        'volunteers_request_join': [],
        'volunteers': [],
        'date_time_start': '',
        'date_time_end': '',
        'events': []
    })

def db_conf_name_edit(cid, new_name):
    ref_conf_coll_doc(cid).update({
        'name': new_name
    })

def db_conf_address_edit(cid, place_id):
    ref_conf_coll_doc(cid).update({
        'place_id': place_id
    })

def db_conf_volunteers_request_join_add(cid, uids):
    ref_conf_coll_doc(cid).update({'volunteers_request_join': firestore.ArrayUnion([uids])})

def db_conf_volunteers_add(cid, uid):
    ref_conf_coll_doc(cid).update({'volunteers_request_join': firestore.ArrayRemove([uid])})
    ref_conf_coll_doc(cid).update({'volunteers': firestore.ArrayUnion([uid])})
    db.collection('users').document(uid).update({'joined_conferences': firestore.ArrayUnion([cid])})

def db_conf_date_time_start(cid, new_date_time_start):
    ref_conf_coll_doc(cid).update({
        'date_time_start': new_date_time_start
    })

def db_conf_date_time_end(cid, new_date_time_end):
    ref_conf_coll_doc(cid).update({
        'date_time_end': new_date_time_end
    })

def db_conf_get(cid):
    return ref_conf_coll_doc(cid).get().to_dict()

def db_conf_joined_conf_get(uid):
    user_conf_cids = db.collection('users').document(uid).get().to_dict()['joined_conferences']
    joined_confs = []

    for conf_id in user_conf_cids:
        joined_confs.append(db_conf_get(conf_id))

    return joined_confs

def db_conf_get_all():
    all_confs = []

    for conf in conf_coll.stream():
        all_confs.append(conf.to_dict())

    return all_confs

def db_conf_get_organiser_uid(cid):
    conf = ref_conf_coll_doc(cid).get().to_dict()
    return conf['organiser']

def db_conf_is_member(cid, uid):
    conf = ref_conf_coll_doc(cid).get().to_dict()

    if uid in conf['volunteers']:
        return True

    return False

###############
#### Forum ####
###############

def db_conf_forum_add(cid, fid, forum_title, forum_type):
    ref_conf_forum_coll(cid).document(fid).set({
        'fid': fid,
        'forum_title': forum_title,
        'forum_type': forum_type
    })

def db_conf_forum_title_edit(cid, fid, new_title):
    ref_conf_forum_coll(cid).document(fid).update({
        'forum_title': new_title
    })

def db_conf_forum_post_add(cid, fid, pid, sent_by, post_title, post_body):
    ref_conf_forum_post_coll(cid, fid).document(pid).set({
        'pid': pid,
        'post_title': post_title,
        'post_body': post_body,
        'sent_by': sent_by,
        'date_time': datetime.now()
    })

def db_conf_forum_post_title_edit(cid, fid, pid, new_title):
    ref_conf_forum_post_coll(cid, fid).document(pid).update({
        'post_title': new_title,
    })

def db_conf_forum_post_body_edit(cid, fid, pid, new_body):
    ref_conf_forum_post_coll(cid, fid).document(pid).update({
        'post_body': new_body,
    })

def db_conf_forum_post_delete(cid, fid, pid):
    for response in ref_conf_forum_post_response_coll(cid, fid, pid).list_documents():
        response.delete()

    ref_conf_forum_post_coll(cid, fid).document(pid).delete()

def db_conf_forum_delete(cid, fid):
    for post in ref_conf_forum_post_coll(cid, fid).list_documents():
        db_conf_forum_post_delete(cid, fid, post.id)

    ref_conf_forum_coll(cid).document(fid).delete()

def db_conf_forum_get(cid, fid):
    return ref_conf_forum_coll(cid).document(fid).get().to_dict()

def db_conf_forum_get_all(cid):
    all_forums = []

    for forum in ref_conf_forum_coll(cid).stream():
        all_forums.append(forum.to_dict())

    return all_forums

def db_conf_forum_post_get(cid, fid, pid):
    return ref_conf_forum_post_coll(cid, fid).document(pid).get().to_dict()

def db_conf_forum_post_get_all(cid, fid):
    all_posts = []

    for post in ref_conf_forum_post_coll(cid, fid).order_by('date_time').stream():
        all_posts.append(post.to_dict())

    return all_posts

def db_conf_forum_post_response_add(cid, fid, pid, mid, sent_by, body):
    ref_conf_forum_post_response_coll(cid, fid, pid).document(mid).set({
        'mid': mid,
        'sent_by': sent_by,
        'body': body,
        'date_time': datetime.now()
    })

def db_conf_forum_post_response_edit(cid, fid, pid, mid, new_body):
    ref_conf_forum_post_response_coll(cid, fid, pid).document(mid).update({
        'body': new_body
    })

def db_conf_forum_post_response_delete(cid, fid, pid, mid):
    ref_conf_forum_post_response_coll(cid, fid, pid).document(mid).delete()

def db_conf_forum_post_response_get(cid, fid, pid, mid):
    return ref_conf_forum_post_response_coll(cid, fid, pid).document(mid).get().to_dict()

def db_conf_forum_post_response_get_all(cid, fid, pid):
    all_responses = []

    for resp in ref_conf_forum_post_response_coll(cid, fid, pid).order_by('date_time').stream():
        all_responses.append(resp.to_dict())

    return all_responses

def db_conf_is_forum_post_made_by_user(cid, fid, pid, uid):
    post = db_conf_forum_post_get(cid, fid, pid)

    if post['sent_by'] == uid:
        return True

    return False

def db_conf_is_forum_post_response_made_by_user(cid, fid, pid, mid, uid):
    response = db_conf_forum_post_response_get(cid, fid, pid, mid)

    if response['sent_by'] == uid:
        return True

    return False

###############
#### TASKS ####
###############

def db_conf_task_add(cid, tid, task_name, task_description, date_time_start, date_time_end):
    ref_conf_tasks_coll(cid).document(tid).set({
        'tid': tid,
        'task_name': task_name,
        'task_description': task_description,
        'assignees': [],
        'status': '',
        'date_time_start': date_time_start,
        'date_time_end': date_time_end
    })

def db_conf_task_name_edit(cid, tid, new_task_name):
    ref_conf_tasks_coll(cid).document(tid).update({
        'task_name': new_task_name
    })

def db_conf_task_description_edit(cid, tid, new_task_dec):
    ref_conf_tasks_coll(cid).document(tid).update({
        'task_description': new_task_dec
    })

def db_conf_task_assignees_add(cid, tid, assignees):
    ref_conf_tasks_coll(cid).document(tid).update({
        'assignees': firestore.ArrayUnion([assignees])
    })

def db_conf_task_assignees_remove(cid, tid, assignee):
    ref_conf_tasks_coll(cid).document(tid).update({
        'assignees': firestore.ArrayRemove([assignee])
    })

def db_conf_task_status_edit(cid, tid, new_status):
    ref_conf_tasks_coll(cid).document(tid).update({
        'status': new_status
    })

def db_conf_task_date_time_start_edit(cid, tid, new_date_time_start):
    ref_conf_tasks_coll(cid).document(tid).update({
        'date_time_start': new_date_time_start
    })

def db_conf_task_date_time_end_edit(cid, tid, new_date_time_end):
    ref_conf_tasks_coll(cid).document(tid).update({
        'date_time_end': new_date_time_end
    })

def db_conf_task_delete(cid, tid):
    ref_conf_tasks_coll(cid).document(tid).delete()

def db_conf_task_get(cid, tid):
    return ref_conf_tasks_coll(cid).document(tid).get().to_dict()

def db_conf_task_get_all(cid):
    tasks = []

    for task in ref_conf_tasks_coll(cid).order_by('date_time_start').stream():
        tasks.append(task.to_dict())

    return tasks

def sortFunc(e):
    return e['date_time_start']

def db_conf_task_assigned_get(cid, uid):
    assigned_tasks = []

    for task in ref_conf_tasks_coll(cid).where(filter=FieldFilter('assignees', 'array_contains', uid)).stream():
        assigned_tasks.append(task.to_dict())

    assigned_tasks.sort(key = sortFunc)

    return assigned_tasks

def db_conf_task_assigned_users_get(cid, tid):
    assigned_users = []

    for uid in db_conf_task_get(cid, tid)['assignees']:
        assigned_users.append(db_user_get(uid))

    return assigned_users

def db_conf_task_unassigned_users_get(cid, tid):
    unassigned_users = []
    
    assigned_uid = db_conf_task_get(cid, tid)['assignees']
    conference_uid = db_conf_get(cid)['volunteers']
    
    unassigned_uid = list(set(conference_uid) - set(assigned_uid))
    
    for uid in unassigned_uid:
        unassigned_users.append(db_user_get(uid))

    return unassigned_users

def db_conf_task_is_user_assigned(cid, tid, uid):
    task = db_conf_task_get(cid, tid)

    if uid in task['assignees']:
        return True
    
    return False

##################
#### SCHEDULE ####
##################

def db_conf_event_add(cid, eid, event_name, date_time_start, date_time_end, description):
    ref_conf_schedule_coll(cid).document(eid).set({
        'eid': eid,
        'event_name': event_name,
        'date_time_start': date_time_start,
        'date_time_end': date_time_end,
        'description': description,
        'authors': []
    })

def db_conf_event_name_edit(cid, eid, new_name):
    ref_conf_schedule_event_coll(cid, eid).update({
        'event_name': new_name
    })

def db_conf_event_description_edit(cid, eid, new_description):
     ref_conf_schedule_coll(cid).document(eid).update({
        'description': new_description
    })
     
def db_conf_event_author_add(cid, eid, name):
    ref_conf_schedule_coll(cid).document(eid).update({
        'authors': firestore.ArrayUnion([name])
    })

def db_conf_event_author_remove(cid, eid, name):
    ref_conf_schedule_coll(cid).document(eid).update({
        'authors': firestore.ArrayRemove([name])
    })
     
def db_conf_event_date_time_start_edit(cid, eid, new_date_time_start):
    ref_conf_schedule_coll(cid).document(eid).update({
        'date_time_start': new_date_time_start
    })

def db_conf_event_date_time_end_edit(cid, eid, new_date_time_end):
    ref_conf_schedule_coll(cid).document(eid).update({
        'date_time_end': new_date_time_end
    })

def db_conf_event_delete(cid, eid):
    ref_conf_schedule_coll(cid).document(eid).delete()

def db_conf_event_get(cid, eid):
    return ref_conf_schedule_coll(cid).document(eid).get().to_dict()

def db_conf_event_get_all(cid):
    events = []

    for event in ref_conf_schedule_coll(cid).order_by('date_time_start').stream():
        events.append(event.to_dict())

    return events

####################
#### ATTENDANCE ####
####################

def db_conf_attendance_add(cid, aid, volunteer, date, description, hours_worked):
    ref_conf_attendance_coll(cid).document(aid).set({
        'aid': aid,
        'volunteer': volunteer,
        'date': date,
        'description': description,
        'status': 'pending',
        'hours_worked': hours_worked
    })

def db_conf_attendance_status_edit(cid, aid, new_status):
    ref_conf_attendance_coll(cid).document(aid).update({
        'status': new_status
    })

def db_conf_attendance_date_edit(cid, aid, new_date):
    ref_conf_attendance_coll(cid).document(aid).update({
        'date': new_date
    })

def db_conf_attendance_description_edit(cid, aid, new_desc):
    ref_conf_attendance_coll(cid).document(aid).update({
        'description': new_desc
    })

def db_conf_attendance_hours_worked_edit(cid, aid, new_hours_worked):
    ref_conf_attendance_coll(cid).document(aid).update({
        'hours_worked': new_hours_worked
    })

def db_conf_attendance_delete(cid, aid):
    ref_conf_attendance_coll(cid).document(aid).delete()

def db_conf_attendance_get(cid, aid):
    return ref_conf_attendance_coll(cid).document(aid).get().to_dict()

def db_conf_attendance_uid_get(cid, uid):
    attendance_arr = []

    for att in ref_conf_attendance_coll(cid).stream():
        if att.to_dict()['volunteer'] == uid:
            attendance_arr.append(att.to_dict())

    return attendance_arr

def db_conf_attendance_date_get(cid, date):
    attendance_arr = []

    for att in ref_conf_attendance_coll(cid).stream():
        if att.to_dict()['date'] == date:
            attendance_arr.append(att.to_dict())

    return attendance_arr

def db_conf_attendance_status_get(cid, status):
    attendance_arr = []

    for att in ref_conf_attendance_coll(cid).stream():
        if att.to_dict()['status'] == status:
            attendance_arr.append(att.to_dict())

    return attendance_arr

def db_conf_attendance_get_all(cid):
    attendance_arr = []

    for att in ref_conf_attendance_coll(cid).stream():
        attendance_arr.append(att.to_dict())

    return attendance_arr
  
#######################
#### CONFERENCES 2 ####
#######################

def db_conf_delete(cid):
    for forum in ref_conf_forum_coll(cid).list_documents():
        db_conf_forum_delete(cid, forum.id)

    for task in ref_conf_tasks_coll(cid).list_documents():
        db_conf_task_delete(cid, task.id)

    for event in ref_conf_schedule_coll(cid).list_documents():
        db_conf_event_delete(cid, event.id)

    ref_conf_coll_doc(cid).delete()
