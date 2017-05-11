import React from 'react';
import ReactCrop from 'react-image-crop'
import Dropzone from 'react-dropzone'
import imageFile from '../avatar100.png';
import "../node_modules/react-image-crop/dist/ReactCrop.css"
import "./LoadAvatar2.css"

function defaultValues(props) {
    return {
        preloaderImg : null,
        crop: {
            x: 10,
            y: 10,
            width: 50,
            height: 50,
            aspect: props.aspect,
        }
    }
}

export default class LoadAvatar extends React.Component {
    
    static defaultProps = {
        loadButtonText: "Загрузить изображение",
        saveButtonText: "Созранить",
        loadHeader: "Выделите необходимую область",
        widthResultImg: 100,
        inline: true,
        maxSizeBytes: 2000000,
        aspect: 1,
        avaWidth: 200,
    }

    static propTypes = {
        loadButtonText: React.PropTypes.string,
        saveButtonText: React.PropTypes.string,
        loadHeader: React.PropTypes.string,
        widthResultImg: React.PropTypes.number,
        inline: React.PropTypes.bool,
        maxSizeBytes: React.PropTypes.any,
        aspect: React.PropTypes.number,
        avaWidth: React.PropTypes.number,
        image: React.PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)
        this.state = defaultValues(this.props);
        this.file = null;
        this.canvas = null;
        this.fileSize = this.processFileSize( this.props.maxSizeBytes );
    }
    
    onCompleteCrop = (crop) => {
        let self = this;
        let currentState = {...this.state}
        currentState.crop.x = crop.x
        currentState.crop.y = crop.y
        currentState.crop.width = crop.width
        currentState.crop.height = crop.height
        this.setState( currentState, () => self.cropByCanvas() )
    }

    cropSave = () => {
        let resultSrc = this.canvas.toDataURL("image/png");
        document.getElementById("avaCrop").src = resultSrc;
        this.setState( defaultValues( this.props ) )
        this.props.onFinish( resultSrc )
    }
    
    cropByCanvas = () => {
        this.canvas = document.getElementById('myCanvas');
        this.canvas.width = this.canvas.width;
        let context = this.canvas.getContext('2d'),
            imageObj = new Image(),
            self = this;
        imageObj.onload = function() {
            let {x,y, width, height} = self.state.crop,
                rWidth = imageObj.width,
                rHeight = imageObj.height,
                sourceX = parseInt( rWidth * x / 100.0 ),
                sourceY = parseInt( rHeight * y / 100.0 ),
                sourceWidth = parseInt( rWidth * width / 100.0 ),
                sourceHeight = parseInt( rHeight * height / 100.0 ),
                destWidth = self.props.widthResultImg,
                destHeight = self.props.widthResultImg,
                destX = 0,
                destY = 0;
            context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
        };
        imageObj.src = this.state.preloaderImg;
    }
    
    onDrop =  (acceptedFiles, rejectedFiles) => {
        let self = this;
        if (acceptedFiles.length) {
            let f = acceptedFiles[0],
                reader = new FileReader();
            
            reader.onload = (function (theFile){
                self.file = theFile
                return function (e) {
                    self.setState({
                        preloaderImg: e.target.result,
                    }, 
                        () => self.cropByCanvas()  
                    )
                }
            })(f);

            reader.readAsDataURL(f);
        }
    }

    processFileSize() {
        let resultSize = 0;
        let mfs = "" + this.props.maxSizeBytes;
        let mfsNumber = parseInt(mfs);
        mfs = mfs.toLowerCase();
        if (mfs.indexOf("kb") != -1 ) {
            resultSize = mfsNumber * 8 * 1000;
        } else if (mfs.indexOf("mb") != -1 ) {
            resultSize = mfsNumber * 8 * 1000000;
        } else if (mfs.indexOf("b") != -1 ) {
            resultSize = mfsNumber * 8;
        } else {
            resultSize = mfsNumber;
        }
        return resultSize;
    }
    
    render() {
        let dopClass = "";
        let {
            image, 
            loadButtonStyle, 
            headerStyle, 
            saveButtonStyle, 
            inline, 
            loadButtonText,
            saveButtonText,
            widthResultImg,
        } = this.props;
        
        if (inline) dopClass = " inlineDiv";
        return (
            <div>
                <div className={`avaStart${dopClass}`}>
                    <p>
                        <img style={{width: `${this.props.avaWidth}px`}} id="avaCrop" src={image} />
                    </p>
                    <Dropzone 
                        accept="image/*"
                        maxSize={this.fileSize}
                        onDrop={this.onDrop}  
                        style={loadButtonStyle}
                        className="dropzone">
                        <div className="upload_file"> {this.props.loadButtonText} </div>
                    </Dropzone>
                    {this.state.preloaderImg && 
                        <canvas 
                            id="myCanvas" 
                            width={this.props.widthResultImg} 
                            height={this.props.widthResultImg}>
                        </canvas> 
                    }
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
