import '../App.css';
import React from 'react';
import { auth, db } from "../firebase";
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from 'react-router-dom';
import HeaderBar from './HeaderBar';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function Posts() {
  const navigate = useNavigate();
  const { cid, fid, forumTitle } = useParams();
  const [accountType, setAccountType] = React.useState('');
  const [postList, setPostList] = React.useState([]);
  const [postTitle, setPostTitle] = React.useState('');
  const [postBody, setPostBody] = React.useState('');
  const [replyMessage, setReplyMessage] = React.useState('');
  const [currPid, setCurrPid] = React.useState('');
  const [replyList, setReplyList] = React.useState([]);
  const [nameList, setNameList] = React.useState([]);
  const [confName, setConfName] = React.useState('')

  // dialog status variable
  const [postOpen, setPostOpen] = React.useState(false);
  const [repliesOpen, setRepliesOpen] = React.useState(false);

  // handles menu functionality
  const goToTasks = () => {
    navigate(`/conference/${cid}`);
  }

  const goToVolunteers = () => {
    navigate(`/conference/${cid}/volunteers`);
  }

  const goToForum = () => {
    navigate(`/conference/${cid}/forum`);
  }

  const goToSchedule = () => {
    navigate(`/conference/${cid}/schedule`);
  }

  const goToApplications = () => {
    navigate(`/conference/${cid}/applications`);
  }

  const goToMyTasks = () => {
    navigate(`/conference/${cid}/myTasks`)
  }

  const goToLogAttendance = () => {
    navigate(`/conference/${cid}/logAttendance`);
  }

  const goToViewAttendance = () => {
    navigate(`/conference/${cid}/viewAttendance`);
  }

  const goToMyFeedback = () => {
    navigate(`/conference/${cid}/myFeedback`);
  }

  // create post dialog handlers
  const handlePostOpen = () => {
    setPostOpen(true);
  };

  const handlePostClose = (makePost) => {
    if (makePost === true) {
      createPost();
    }

    setPostOpen(false);
  };

  // reply post dialog handlers
  const handleRepliesOpen = async (postId) => {
    // set current post id to postId - this will cause useffect to re-render replies to new post
    setCurrPid(postId);

    // set reply message to default
    setReplyMessage('');

    // open replies
    setRepliesOpen(true);
  };

  const handleRepliesClose = (reply) => {
    // post reply if user clicked 'send'
    if (reply === true) {
      replyToPost()
    } else {
      // close replies
      setRepliesOpen(false);
    }
  };

  // handling reply message
  const handleReplyMessage = (event) => {
    setReplyMessage(event.target.value);
  }

  // get current conference details
  React.useEffect(() => {
    async function getConfDetails() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/conference/details?cid=${cid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer: ${token}`
            }
          });

          if (!response.ok) {
            console.error('Failed to fetch conferences details. Status', response.status);
            return;
          }

          const data = await response.json();
          setConfName(data.conference.name)
        }
      })
    }

    getConfDetails()
  }, [cid])

  // make a post
  async function createPost() {
    // create post
    const user = auth.currentUser;
    const token = await getIdToken(user);
    await fetch(`http://localhost:8001/forum/make_post?cid=${cid}&fid=${fid}&post_title=${postTitle}&post_body=${postBody}`, {
      credentials: 'include',
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // update postList
    const response = await fetch(`http://localhost:8001/forum/get_all_posts?cid=${cid}&fid=${fid}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setPostList(data.posts);
  }

  // send reply to a post
  async function replyToPost() {
    const user = auth.currentUser;
    const token = await getIdToken(user);
    await fetch(`http://localhost:8001/forum/respond_post?cid=${cid}&fid=${fid}&pid=${currPid}&body=${replyMessage}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // set reply message to default
    setReplyMessage('');

    // update replyList
    const response = await fetch(`http://localhost:8001/forum/get_all_messages?cid=${cid}&fid=${fid}&pid=${currPid}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to get post replies. Status:', response.status);
      }

      const data = await response.json();
      setReplyList(data.messages);
  }

  // get all posts in this forum
  React.useEffect(() => {
    async function getPosts() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/forum/get_all_posts?cid=${cid}&fid=${fid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error('Failed to get posts. Status:', response.status);
          }

          const data = await response.json();
          setPostList(data.posts);
        }
      })
    }

    getPosts()
  }, [cid, fid]);

  // get all post replies when currPid changes
  React.useEffect(() => {
    async function getReplies() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await getIdToken(user);
          const response = await fetch(`http://localhost:8001/forum/get_all_messages?cid=${cid}&fid=${fid}&pid=${currPid}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.error('Failed to get post replies. Status:', response.status);
          }

          const data = await response.json();
          setReplyList(data.messages);
        }
      })
    }
    if (currPid !== '') {
      getReplies();
    }
  }, [cid, fid, currPid])

  // get all names of people who replied to the current post
  React.useEffect(() => {
    async function getReplyNames() {
      const names = [];
      for (const index in replyList) {
        const response = await fetch(`http://localhost:8001/user/get_profile?uid=${replyList[index].sent_by}`, {
          method: 'GET',
          mode: 'cors',
        })

        if (!response.ok ) {
          console.error('Failed to get user info. Status:', response.status);
        };

        const data = await response.json();
        names.push(data.user.first_name + ' ' + data.user.last_name)
      }
      setNameList(names);
    }
    getReplyNames();
  }, [cid, fid, replyList]);

  // Check if the user is not authenticated, and if so, navigate to the login page
  React.useEffect(() => {
    const currUserInfo = onAuthStateChanged(auth, (user) => {
      if (!user) {
          navigate('/login')
      } else {
        const fetchAdditionalData = async () => {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAccountType(userData.account_type);
          } else {
            console.log("No additional data for this user in database");
          }
        }
        fetchAdditionalData();
      }
    });

    return () => {
      currUserInfo();
    };
  }, [navigate]);

  return (
    <div>
      <div>
          <HeaderBar />
          <p className='page-name'> Conference: {confName}</p>
      </div>
      <div className='conf-container'>
        <Sidebar>
          <Menu>
            <MenuItem className="menuItems" onClick={goToTasks}>Tasks</MenuItem>
            <MenuItem className="menuItems" onClick={goToVolunteers}>Volunteers</MenuItem>
            <MenuItem className="menuItems" onClick={goToForum}>Forum</MenuItem>
            <MenuItem className="menuItems" onClick={goToSchedule}>Schedule</MenuItem>
            {accountType === 'organiser' ? <MenuItem className="menuItems" onClick={goToApplications}>Applications</MenuItem> : null}
            {accountType !== 'organiser' ? <MenuItem className="menuItems" onClick={goToMyTasks}>My Tasks</MenuItem> : null}
            {accountType !== 'organiser' ? <MenuItem className="menuItems" onClick={goToLogAttendance}>Log Attendance</MenuItem> : null}
            {accountType !== 'volunteer' ? <MenuItem className="menuItems" onClick={goToViewAttendance}>View Attendance</MenuItem> : null}
            {accountType !== 'organiser' ? <MenuItem className="menuItems" onClick={goToMyFeedback}>My Feedback</MenuItem> : null}
          </Menu>
        </Sidebar>
        <div className='conf-page'>
          <h2>{forumTitle}</h2>
          {forumTitle === 'Announcements' && accountType !== 'organiser' ? null : <Button variant="contained" size="small" onClick={handlePostOpen} >Create Post</Button>}
          <br/><br/>
          {postList?.toReversed().map((post, index) => {
            return (
              <div key={index} >
                <Card sx={{ minWidth: 800, border: '1px solid' }} variant="outlined" >
                  <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      #{postList.length - index}
                      <Typography sx={{ fontSize: 14, float: 'right'}} component="span" color="text.secondary"> sent at: {post.date_time} </Typography>
                    </Typography>

                    <Typography variant="h5">
                      {post.post_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {post.post_body}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleRepliesOpen(post.pid)}>Reply</Button>
                  </CardActions>
                </Card>
                <br></br>
              </div>
            );
          })}
        </div>
      </div>
      <Dialog open={postOpen} >
          <DialogTitle>Make a Post</DialogTitle>
          <DialogContent>
              <DialogContentText>
                  Please give your post a relevant title and body
              </DialogContentText>
              <TextField
                  autoFocus
                  margin="dense"
                  label="Title"
                  fullWidth
                  variant="standard"
                  onChange={(e) => setPostTitle(e.target.value)}
              />
              <TextField
                  autoFocus
                  margin="dense"
                  label="Type post here..."
                  fullWidth
                  variant="standard"
                  onChange={(e) => setPostBody(e.target.value)}
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => handlePostClose(false)}>Cancel</Button>
              <Button onClick={() => handlePostClose(true)}>Create Post</Button>
          </DialogActions>
      </Dialog>

      <Dialog open={repliesOpen} fullWidth={true} maxWidth={'lg'} onClose={() => handleRepliesClose(false)} >
          <DialogTitle>Replies</DialogTitle>
          <DialogContent>
              {replyList?.map((message, index) => {
                return <div key={index}>
                      <DialogContentText>{nameList[index]}: {message.body}</DialogContentText>
                  </div>
              })}
          </DialogContent>
          <DialogActions>
              <TextField
                  autoFocus
                  margin="dense"
                  label="Type reply here..."
                  fullWidth
                  variant="standard"
                  value={replyMessage}
                  onChange={(e) => handleReplyMessage(e)}
              />
              <Button onClick={() => handleRepliesClose(true)}>Send</Button>
          </DialogActions>
      </Dialog>
    </div>
  );
};

export default Posts;