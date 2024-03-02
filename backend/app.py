from flask import Flask
from flask import request
from flask_cors import CORS
from auth import *
from user import *
from conference import *
from forum import *
from task import *
from schedule import *
from attendance import *
from feedback import *

app = Flask(__name__)
CORS(app, supports_credentials=True) # enables CORS for all routes

#############################
# ROUTES FOR AUTHENTICATION #
#############################

@app.route('/auth/login' ,  methods=['POST'])
def auth_login_route():
    return auth_login(request.args)

@app.route('/auth/logout', methods=['POST'])
def auth_logout_route():
    return auth_logout(request.args)

@app.route('/auth/register', methods=['POST'])
def auth_register_route():
    return auth_register(request.args)

@app.route('/auth/delete', methods=['DELETE'])
def auth_delete_route():
    return auth_delete(request.args)

###########################
# ROUTES FOR USER EDITING #
###########################

@app.route('/user/edit_profile', methods=['PUT'])
def user_edit_route():
    return user_edit(request)

@app.route('/user/get_profile', methods=['GET'])
def user_get_route():
    return user_get(request.args)

##########################
# ROUTES FOR CONFERENCES #
##########################

@app.route('/conference/create', methods=['POST'])
def conference_create_route():
    return conference_create(request)

@app.route('/conference/join', methods=['POST'])
def conference_join_route():
    return conference_join(request)

@app.route('/conference/invite', methods=['POST'])
def conference_invite_route():
    return conference_invite(request.args)

@app.route('/conference/list', methods=['GET'])
def conference_list_route():
    return conference_list(request)

@app.route('/conference/list/all', methods=['GET'])
def conference_list_all_route():
    return conference_list_all(request.args)

@app.route('/conference/approve', methods=['POST'])
def conference_approve_route():
    return conference_approve(request.args)

@app.route('/conference/details', methods=['GET'])
def conference_details_route():
    return conference_details(request.args)

@app.route('/conference/promote', methods=['PUT'])
def conference_promote_route():
    return conference_promote(request)

@app.route('/conference/nearby', methods=['GET'])
def conference_nearby_route():
    return conference_nearby(request)

####################
# ROUTES FOR FORUM #
####################

@app.route('/forum/make_post', methods=['POST'])
def forum_make_post_route():
    return forum_make_post(request)

@app.route('/forum/respond_post', methods=['POST'])
def forum_respond_post_route():
    return forum_respond_post(request)

@app.route('/forum/edit_post', methods=['PUT'])
def forum_edit_post_route():
    return forum_edit_post(request)

@app.route('/forum/remove_post', methods=['DELETE'])
def forum_remove_post_route():
    return forum_remove_post(request)

@app.route('/forum/get_all_posts', methods=['GET'])
def forum_get_all_posts_route():
    return forum_get_all_posts(request)

@app.route('/forum/get_all_messages', methods=['GET'])
def forum_get_all_messages_route():
    return forum_get_all_messages(request)

@app.route('/forum/get_all_forums', methods=['GET'])
def forum_get_all_forums_route():
    return forum_get_all_forums(request)

@app.route('/forum/edit_message', methods=['PUT'])
def forum_edit_message_route():
    return forum_edit_message(request)

@app.route('/forum/remove_message', methods=['DELETE'])
def forum_remove_message_route():
    return forum_remove_message(request)

####################
# ROUTES FOR TASK #
####################

@app.route('/task/create_task', methods=['POST'])
def task_create_task_route():
    return task_create_task(request)

@app.route('/task/get_all_tasks', methods=['GET'])
def task_get_all_tasks_route():
    return task_get_all_tasks(request)

@app.route('/task/remove_task', methods=['DELETE'])
def task_remove_task_route():
    return task_remove_task(request)

@app.route('/task/assign_task', methods=['POST'])
def task_assign_task_route():
    return task_assign_task(request)

@app.route('/task/unassign_task', methods=['DELETE'])
def task_unassign_task_route():
    return task_unassign_task(request)

@app.route('/task/sign_up_task', methods=['POST'])
def task_sign_up_task_route():
    return task_sign_up_task(request)

@app.route('/task/unsign_up_task', methods=['DELETE'])
def task_unsign_up_task_route():
    return task_unsign_up_task(request)

@app.route('/task/get_all_user_tasks', methods=['GET'])
def task_get_all_user_tasks_route():
    return task_get_all_user_tasks(request)

@app.route('/task/get_all_assigned_users', methods=['GET'])
def task_get_all_assigned_users_route():
    return task_get_all_assigned_users(request)

@app.route('/task/get_all_unassigned_users', methods=['GET'])
def task_get_all_unassigned_users_route():
    return task_get_all_unassigned_users(request)

#######################
# ROUTES FOR SCHEDULE #
#######################

@app.route('/schedule/event_add', methods=['POST'])
def schedule_event_add_route():
    return schedule_event_add(request)

@app.route('/schedule/event_remove', methods=['DELETE'])
def schedule_event_remove_route():
    return schedule_event_remove(request)

@app.route('/schedule/event_get_all', methods=['GET'])
def schedule_event_get_all_route():
    return schedule_event_get_all(request)

@app.route('/schedule/event_get', methods=['GET'])
def schedule_event_get_route():
    return schedule_event_get(request)

@app.route('/schedule/event_author_add', methods=['POST'])
def schedule_event_author_add_route():
    return schedule_event_author_add(request)

@app.route('/schedule/event_author_remove', methods=['DELETE'])
def schedule_event_author_remove_route():
    return schedule_event_author_remove(request)

#########################
# ROUTES FOR ATTENDANCE #
#########################

@app.route('/attendance/log_attendance', methods=['POST'])
def attendance_log_attendance_route():
    return attendance_log_attendance(request)

@app.route('/attendance/get_all_users', methods=['GET'])
def attendance_get_all_users_route():
    return attendance_get_all_users(request)

@app.route('/attendance/get_all_user_attendances', methods=['GET'])
def attendance_get_all_user_attendances_route():
    return attendance_get_all_user_attendances(request)

@app.route('/attendance/approve_attendance', methods=['POST'])
def attendance_approve_attendance_route():
    return attendance_approve_attendance(request)

@app.route('/attendance/delete_attendance', methods=['DELETE'])
def attendance_delete_attendance_route():
    return attendance_delete_attendance(request)

@app.route('/attendance/fill_in_feedback', methods=['POST'])
def attendance_fill_in_feedback_route():
    return fill_in_feedback(request)

@app.route('/attendance/get_user_feedback', methods=['GET'])
def attendance_get_user_feedback_route():
    return get_user_feedback(request)

@app.route('/attendance/get_feedback', methods=['GET'])
def attendance_get_feedback_route():
    return get_feedback(request)

@app.route('/attendance/rate_volunteer', methods=['POST'])
def attendance_rate_volunteer_route():
    return rate_volunteer(request)

@app.route('/attendance/get_averaged_rating', methods=['GET'])
def attendance_get_averaged_rating_route():
    return get_averaged_rating(request)

@app.route('/attendance/get_rating', methods=['GET'])
def attendance_get_rating_route():
    return get_rating(request)

if __name__ == '__main__':
    app.run(debug=True, port=8001)

