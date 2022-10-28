import React, { useRef, useEffect, useState } from "react"
import { CloseIcon, contentCopyIcon, MicIcon, MicOffIcon, VideocamIcon, VideocamOffIcon, SecurityIcon, SupervisorAccountIcon, ChatBubbleIcon } from "@mui/icons-material"
import Peer from "simple-peer"
import CopyToClipboard from "react-copy-to-clipboard"
import Loader from "../components/Loader"

const Container = styled.div`
  display: flex;
  height: 100vh;
`

const MainContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const VideoContainer = styled.div`
  flex-grow: 1;
  background-color: black;
  border: 1px solid green;
  display: flex;
  justify-content: center;
  align-items: center;
  > video {
    max-width: 30rem;
    max-height: 22rem;
    border: 1px solid red;
  }
`

const VideoFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-self: center;
  position: sticky;
  bottom: 0;
  width: 100%;
  z-index: 999;
  background-color: #1d1d1d;
  color: #d2d2d2;
  padding: 0.2rem;
`

const ControlsLeft = styled.div`
  display: flex;
`

const ControlsCenter = styled.div`
  display: flex;
`

const ControlsRight = styled.div`
  display: flex;
  align-items: center;
  color: #d40303;
  cursor: pointer;
  margin-right: 1.2rem;
`

const ControlButton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 6rem;
  padding: 0.5rem;
  cursor: pointer;
  > span {
    margin-top: 0.2rem;
  }
  :hover {
    background-color: #3d3d3d;
    border-radius: 0.5rem;
  }
`

const ChatContainer = styled.div`
  flex: 0.25;
  background-color: #2c2c2c;
  display: ${({ chat }) => (chat ? "flex" : "none")};
  flex-direction: column;
  align-items: center;
  border-left: 1px solid #3d3d3d;
  > h5 {
    color: #d2d2d2;
    padding: 1rem;
  }
`

const Chat = styled.div`
  flex-grow: 1;
`

const InputContainer = styled.div`
  padding: 1.5rem 1rem;
  width: 100%;
  background-color: #1d1d1d;
  > input {
    border: 0px;
    background: transparent;
    outline: none;
    font-size: 0.95rem;
    color: whitesmoke;
    width: 100%;
  }
`

const JoinModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 99999;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${(props) => (props.show ? "grid" : "none")};
  place-items: center;
`

const FormContainer = styled.div`
  background-color: #1d1d1d;
  border: 1px solid gray;
  border-radius: 0.5rem;
  padding: 2.1rem;
  max-width: 25rem;
  text-align: left;
  > h2 {
    color: white;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin: 2rem 0;
  margin-bottom: 4rem;
  min-width: 20rem;
`

const Input = styled.input`
  background: transparent;
  padding: 0.7rem;
  border: 1px solid gray;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  :focus {
    outline: none;
    border: 0.1px solid rgb(28, 107, 226);
  }
`

const FormButtons = styled.div`
  display: flex;
`

const Button = styled.button`
  background: transparent;
  border-radius: 0.5rem;
  border: 1px solid gray;
  color: white;
  margin: 0.75rem 1rem;
  padding: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  width: 100%;
  :hover {
    background-color: #535353c3;
  }
  ${(props) =>
    props.primary &&
    css`
      border: 1px solid #0172e4;
      background-color: #0172e4;
      :hover {
        background-color: #0163e4;
      }
      :disabled {
        background-color: #2e2e2e;
        border: 1px solid #2e2e2e;
        color: gray;
      }
    `}
`

const AnswerCallContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 99999;
  background-color: rgba(0, 0, 0, 0.6);
  display: ${(props) => (props.show ? "grid" : "none")};
  place-items: center;
`

const Modal = styled.div`
  background-color: #1d1d1d;
  border: 1px solid gray;
  border-radius: 0.5rem;
  min-width: 25rem;
  padding: 1rem;
  text-align: left;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #d2d2d2;
  padding-bottom: 1rem;
  border-bottom: 1px solid gray;
`

const Close = styled(CloseIcon)`
  cursor: pointer;
`

const ContentCopy = styled(ContentCopyIcon)`
  cursor: pointer;
`

const Participants = styled.div`
  display: flex;
  flex-direction: column;
  color: #d2d2d2;
  min-height: 10rem;
`;
const User = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
`

const AcceptButton = styled.button`
  padding: 0.2rem;
  border-radius: 0.5rem;
  color: #d2d2d2;
  border: 1px solid #0172e4;
  background-color: #0163e4;
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #d2d2d2;
  padding-top: 1rem;
  border-top: 1px solid gray;
`

const ChatRoom = ({ chatRoom, me, socket }) => {
  const [stream, setStream] = useState(null)
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState("")
  const [callerSignal, setCallerSignal] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState("")
  const [idToCall, setIdToCall] = useState("")
  const [loading, setLoading] = useState(false)
  const [chat, setChat] = useState(true)
  const [modal, setModal] = useState(true)
  const [mute, setMute] = useState(false)
  const [stopVideo, setStopVideo] = useState(false)

  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef()

  
}


