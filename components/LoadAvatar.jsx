import React from 'react';
import ReactCrop from 'react-image-crop'
import Dropzone from 'react-dropzone'
import imageFile from '../avatar100.png';
import "../node_modules/react-image-crop/dist/ReactCrop.css"

import "./LoadAvatar.css"

function defaultValues() {
    return {
        preloaderImg : null,
        crop: {
            x: 10,
            y: 10,
            width: 10,
            height: 10,
        }
    }
}

export default class LoadAvatar extends React.Component {
    
    static defaultProps = {
        loadButtonText: "Загрузить изображение",
        saveButtonText: "Созранить",
        loadHeader: "Выделите необходимую область"
    }

    static propTypes = {
        loadButtonText: React.PropTypes.string,
        saveButtonText: React.PropTypes.string,
        loadHeader: React.PropTypes.string,
        inline: React.PropTypes.bool,
        image: React.PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)
        this.state = defaultValues();
        this.file = null;
    }

    onCompleteCrop = (crop, pixelCrop) => {
        let currentState = {...this.state}
        currentState.crop.x = crop.x
        currentState.crop.y = crop.y
        currentState.crop.width = crop.width
        currentState.crop.height = crop.height
        this.setState( currentState )
    }

    cropSave = () => {
        if (this.file) {
               const {x,y,width, height} = this.state.crop
               alert( `Файл готов к отправке. Данные выделения  x: ${x} y:${y} width: ${width} height: ${height}` )
               this.setState( defaultValues() )
        } else {
            alert("Загрузите файл")
        }
    }
    
    cropEnd = (err, res) => {
        const indexImage = this.props.indexImage
        if (err || !res.ok) {
            alert('Oh no! error');
        } else {
            let {url} = res.body
            this.props.onEnd(err, res.body)
        }
    }
    
    onDrop =  (acceptedFiles, rejectedFiles) => {
        let self = this;
        if (acceptedFiles.length) {
            let f = acceptedFiles[0];
            let reader = new FileReader();
            reader.onload = (function (theFile){
                self.file = theFile
                return function (e) {
                    self.setState({
                        preloaderImg: e.target.result,
                    })
                }
            })(f);
            reader.readAsDataURL(f);
        }
        
    }
    
    render() {
        let {
            image, 
            loadButtonStyle, 
            headerStyle, 
            saveButtonStyle, 
            sizeBytes, 
            inline, 
            loadButtonText,
            saveButtonText,
        } = this.props;
        let dopClass = "";
        if (inline) dopClass = " inlineDiv";
        return (
            <div>
                <div className={`avaStart${dopClass}`}>
                    <p>
                        <img src={image} />
                    </p>
                    
                    <Dropzone 
                        accept="image/*"
                        maxSize={sizeBytes}
                        onDrop={this.onDrop}  
                        style={loadButtonStyle}
                        className="dropzone">
                        <div className="upload_file"> {this.props.loadButtonText} </div>
                    </Dropzone>
                </div>
                
                {this.state.preloaderImg &&
                    <div className={`cropDiv${dopClass}`}>
                        <h3 style={headerStyle}> {this.props.loadHeader} </h3>
                        <ReactCrop 
                            onComplete={this.onCompleteCrop} 
                            keepSelection={true} 
                            src={this.state.preloaderImg} 
                            crop={this.state.crop} 
                        />
                        <button 
                            className="saveButton" 
                            style={saveButtonStyle} 
                            onClick={this.cropSave}> 
                             {this.props.saveButtonText}
                        </button>
                    </div>
                }
            </div>
        )
    }
}
