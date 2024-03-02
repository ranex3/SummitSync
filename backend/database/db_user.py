from database.db_conn import db
from firebase_admin import firestore

users_coll = db.collection('users')

rating_str = 'ratings'
feedback_str = 'feedback'

#################
#### HELPERS ####
#################

def ref_user_coll_doc(uid):
    return users_coll.document(uid)

def ref_user_rating_coll(uid):
    return ref_user_coll_doc(uid).collection(rating_str)

def ref_user_feedback_coll(uid):
    return ref_user_coll_doc(uid).collection(feedback_str)

#################
#### General ####
#################

def db_user_add(uid, f_name, l_name, email_addr, acc_type, gender, dob, place_id):
    users_coll.document(uid).set({
        'uid': uid,
        'first_name': f_name,
        'last_name': l_name,
        'account_type': acc_type,
        'joined_conferences': [],
        'email_address': email_addr,
        'place_id': place_id,
        'phone_num': '',
        'dob': dob,
        'gender': gender,
        'education': '',
        'skills': [],
        'research_interests': [],
        'availability': [],
    })

def db_user_first_name_edit(uid, f_name):
    users_coll.document(uid).update({
        'first_name': f_name
    })

def db_user_last_name_edit(uid, l_name):
    users_coll.document(uid).update({
        'last_name': l_name
    })

def db_user_account_type_edit(uid, new_acc_type):
    users_coll.document(uid).update({
        'account_type': new_acc_type
    })

def db_user_conf_joined_add(uid, cid):
    users_coll.document(uid).update({
        'joined_conferences': firestore.ArrayUnion([cid])
    })

def db_user_email_address_edit(uid, email_addr):
    users_coll.document(uid).update({
        'email_address': email_addr
    })

def db_user_address_edit(uid, place_id):
    users_coll.document(uid).update({
        'place_id': place_id
    })

def db_user_phone_number_edit(uid, phone_num):
    users_coll.document(uid).update({
        'phone_number': phone_num
    })

def db_user_dob_edit(uid, dob):
    users_coll.document(uid).update({
        'dob': dob
    })

def db_user_gender_edit(uid, gender):
    users_coll.document(uid).update({
        'gender': gender
    })

def db_user_education_edit(uid, education):
    users_coll.document(uid).update({
        'education': education
    })

def db_user_skills_edit(uid, skills):
    skills_array = skills.split(',')
    skills_array = [skill.strip() for skill in skills_array]

    users_coll.document(uid).update({
        'skills': skills_array
    })

def db_user_research_interests_edit(uid, res_ints):
    res_int_array = res_ints.split(',')
    res_int_array = [res_int.strip() for res_int in res_int_array]

    users_coll.document(uid).update({
        'research_interests': res_int_array
    })

def db_user_availability_edit(uid, availability):
    availability_array = availability.split(',')
    availability_array = [availability.strip() for availability in availability_array]

    users_coll.document(uid).update({
        'availability': availability_array
    })

def db_user_delete(uid):
    users_coll.document(uid).delete()

def db_user_get(uid):
    user = users_coll.document(uid).get()

    if user.exists:
        return user.to_dict()
    else:
        return None

def db_user_account_type_get(uid):
    return users_coll.document(uid).get().to_dict()['account_type']

################
#### RATING ####
################

def db_user_rating_add(uid, rater_id, rating):
    ref_user_rating_coll(uid).document(rater_id).set({
        'rating': rating,
        'rater_id': rater_id
    })

def db_user_rating_edit(uid, rater_id, new_rating):
    ref_user_rating_coll(uid).document(rater_id).update({
        'rating': new_rating
    })

def db_user_rating_delete(uid, rater_id):
    ref_user_rating_coll(uid).document(rater_id).delete()

def db_user_rating_get(uid, rater_id):
    return ref_user_rating_coll(uid).document(rater_id).get().to_dict()

def db_user_rating_get_rating(uid):
    num_ratings = 0
    sum_ratings = 0

    for rating in ref_user_rating_coll(uid).stream():
        sum_ratings = sum_ratings + int(rating.to_dict()['rating'])
        num_ratings = num_ratings + 1

    if num_ratings == 0:
        return 0
    else:
        return sum_ratings / num_ratings

##################
#### FEEDBACK ####
##################

def db_user_feedback_add(uid, fid, sent_by, cid, feedback):
    ref_user_feedback_coll(uid).document(fid).set({
        'fid': fid,
        'sent_by': sent_by,
        'cid': cid,
        'feedback': feedback,
    })

def db_user_feedback_edit(uid, fid, new_feedback):
    ref_user_feedback_coll(uid).document(fid).update({
        'feedback': new_feedback
    })

def db_user_feedback_delete(uid, fid):
    ref_user_feedback_coll(uid).document(fid).delete()

def db_user_feedback_get(uid, fid):
    return ref_user_feedback_coll(uid).document(fid).get().to_dict()

def db_user_feedback_sent_by_get(uid, sent_by):
    feedback_stream = ref_user_feedback_coll(uid).stream()

    for feedback in feedback_stream:
        if feedback.to_dict()['sent_by'] == sent_by:
            return feedback.to_dict()

    return None

def db_user_feedback_cid_get(uid, cid):
    all_feedback = []

    for feedback in ref_user_feedback_coll(uid).stream():
        if feedback.to_dict()['cid'] == cid:
            all_feedback.append(feedback.to_dict())

    return all_feedback

def db_user_feedback_get_all(uid):
    all_feedback = []

    for feedback in ref_user_feedback_coll(uid).stream():
        all_feedback.append(feedback.to_dict())

    return all_feedback
