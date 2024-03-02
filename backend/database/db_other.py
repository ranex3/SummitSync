from database.db_conn import db
from database.db_conf import db_conf_delete
from database.db_user import db_user_delete

conferences_coll = db.collection('conferences')
users_coll = db.collection('users')

def db_reset():
    conf_docs = conferences_coll.list_documents()
    users_docs = users_coll.list_documents()

    for conf in conf_docs:
        db_conf_delete(conf.id)

    for user in users_docs:
        db_user_delete(user.id)
