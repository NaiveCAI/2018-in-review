import * as THREE from 'three'
import { TweenMax } from 'gsap'
import TinyGesture from 'tinygesture'
import AssetLoader from '../utils/AssetLoader'
import Item from './Item'
import Section from './Section'

import months from '../config/months'
import assetOrder from '../config/assetOrder'
import assetData from '../config/assetData'

export default class Timeline {

    constructor() {

        this.setConfig()
        this.init()

        if( !window.assets ) {
            this.loadAssets()
            console.log('reload assets')
        } else {
            console.log('cached assets')
            this.assets = window.assets
            this.createTimeline()
        }
    
    }

    setConfig() {

        this.dom = {
            cursor: document.querySelector('.cursor'),
            mainSvgs: document.querySelectorAll('main svg'),
            cursorSvgs: document.querySelectorAll('.cursor svg'),
        }

        this.c = {
            dpr: window.devicePixelRatio >= 2 ? 2 : 1,
            startTime: Date.now(),
            size: {
                w: window.innerWidth,
                h: window.innerHeight
            },
            scrollPos: 0,
            scrolling: false,
            allowScrolling: true,
            autoMoveSpeed: 0,
            isMobile: this.isMobile(),
            holdingMouseDown: false,
            touchEnabled: ('ontouchstart' in window)
        }

        if( this.c.touchEnabled ) document.documentElement.classList.add('touch-enabled')

        this.assetList = assetOrder
        this.assetList.intro = ['ok.png']
        this.assetList.end = ['wave.mp4']
        this.assetData = assetData

        this.activeMonth = 'intro'
        this.months = months
        this.monthPositions = {}
        this.remainingMonths = []
        this.enableLoader = true
        this.gyroEnabled = false

        if( !this.enableLoader ) document.querySelector('.loading').style.display = 'none'
       
    }

    isMobile() {
        let a = navigator.userAgent||navigator.vendor||window.opera
        return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))
    }

    loadAssets() {

        let assetLoader = new AssetLoader( this.c.isMobile )
        
        if( this.enableLoader ) {
            setTimeout( () => {
                assetLoader.load( this.assetList, this.renderer ).then( assets => {

                    this.assets = assets
                    console.log('ASSETS LOADED');

                    // all assets loaded - initialise
                    this.createTimeline()

                })
            }, 3000 )
        } else {

            assetLoader.load( this.assetList, this.renderer ).then( assets => {

                this.assets = assets
                console.log('ASSETS LOADED');

                // all assets loaded - initialise
                this.createTimeline()

            })

        }

    }

    init() {

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setPixelRatio( this.c.dpr )
        this.renderer.setSize( this.c.size.w, this.c.size.h )
        document.body.appendChild( this.renderer.domElement )
        this.preventPullToRefresh()

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color( 0xAEC7C3 )
        this.scene.fog = new THREE.Fog( 0xAEC7C3, 1400, 2000 )
        if( this.c.size.w < 600 ) this.scene.scale.set( 0.4, 0.4, 1 )

        let cameraPosition = 800;

        const fov = 180 * ( 2 * Math.atan( this.c.size.h / 2 / cameraPosition ) ) / Math.PI // TODO: fix mobile scaling
        this.camera = new THREE.PerspectiveCamera( fov, this.c.size.w / this.c.size.h, 1, 2000 )
        this.camera.position.set( 0, this.enableLoader ? 2000 : 0, cameraPosition )

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = this.camera.near
        this.raycaster.far = this.camera.far
        this.intersects = []
        this.linkIntersect = []
        this.frustum = new THREE.Frustum()
        this.cameraViewProjectionMatrix = new THREE.Matrix4()
        this.mouse = new THREE.Vector2()
        this.mousePerspective = new THREE.Vector2()

        window.addEventListener( 'devicemotion', event => {
            if( event.rotationRate.alpha || event.rotationRate.beta || event.rotationRate.gamma ) {
                this.gyroEnabled = true
            }
        })

    }

    createTimeline() {

        this.timeline = new THREE.Group()
        this.scene.add( this.timeline )
            
        this.textMat = new THREE.MeshBasicMaterial( { color: 0x1b42d8, transparent: true } )
        this.captionTextMat = new THREE.MeshBasicMaterial( { color: 0x1b42d8, transparent: true, opacity: 0, visible: false } )
        this.linkUnderlineMat = new THREE.MeshBasicMaterial( { color: 0x1b42d8, transparent: true, opacity: 0, visible: false } )
        this.textOutlineMat = new THREE.MeshBasicMaterial( { color: 0x1b42d8, transparent: true } )
        this.contactTextMat = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } )

        this.sections = {}
        this.items = {}
        this.itemMeshes = [] // array for raycasting mouse
        this.videoItems = []

        let itemIndexTotal = 0, nextMonthPos = 0

        for( let month in this.months ) {

            this.sections[ month ] = new Section({
                timeline: timeline,
                section: month
            })

            if( month !== 'intro' && month !== 'end' ) {

                let itemIndex = 0, id

                // add items
                for( let filename in this.assets.textures[ month ] ) {

                    id = `${month}/${filename}`

                    this.items[id] = new Item({
                        timeline: this,
                        texture: this.assets.textures[ month ][ filename ],
                        data: this.assetData[ month ][ filename ],
                        month: month,
                        itemIndex: itemIndex,
                        itemIndexTotal: itemIndexTotal
                    })

                    this.sections[ month ].add( this.items[id] )

                    itemIndex++
                    itemIndexTotal++

                }

            }

            let bbox = new THREE.Box3().setFromObject( this.sections[ month ] );

            this.sections[month].position.z = nextMonthPos
            this.monthPositions[month] = nextMonthPos + 1100 ;
            let posOffset = 800; // TODO: get from camera?
            if( month === 'intro' ) posOffset = 1700
            if( month === 'dec' ) posOffset = 1800
            nextMonthPos += bbox.min.z - posOffset

            this.timeline.add( this.sections[month] )

            if( month === 'end' ) this.stopScrollPos = this.sections[month].position.z

        }

        this.videoCount = this.videoItems.length - 1

        this.contactSection = new Section({
            timeline: timeline,
            section: 'contact'
        })
        this.contactSection.visible = false
        this.scene.add( this.contactSection )


        console.log('RENDER')
        this.animate()
        this.initListeners()
        document.body.classList.add('ready')

    }

    moveToStart() {

        TweenMax.to( this.camera.position, 2, {
            y: 0,
            ease: 'Expo.easeInOut'
        })

        TweenMax.to( '.loading', 2, {
            y: '-100%',
            ease: 'Expo.easeInOut',
            onComplete() {
                document.querySelector('.loading').style.display = 'none'
            }
        })

        TweenMax.to( '.say-hello', 2, {
            autoAlpha: 1,
            ease: 'Expo.easeInOut'
        })

    }

    openItem( item ) {

        this.itemAnimating = true
        this.itemOpen = item
        this.origTimelinePos = this.timeline.position.z
        this.c.allowScrolling = false

        if( this.c.isMobile ) {
            let texture = item.mesh.material.uniforms.texture.value
            if( texture.mediaType === 'video' ) {
                texture.image.src = 'assets/' + texture.name
                texture.image.play()
            }
        }

        let posOffset = this.sections[ this.activeMonth ].position.z;

        if( item.month !== this.activeMonth ) {
            posOffset = this.sections[ this.remainingMonths[ this.remainingMonths.length - 2 ] ].position.z
        }

        TweenMax.to( item.position, 1.5, {
            x: 0,
            y: 0,
            ease: 'Expo.easeInOut',
            onComplete: () => {
                this.itemAnimating = false
                this.dom.cursor.dataset.cursor = 'cross'
            }
        })

        TweenMax.to( item.uniforms.progress, 1.5, {
            value: 1,
            ease: 'Expo.easeInOut'
        })

        TweenMax.to( this.timeline.position, 1.5, {
            z: -(posOffset - -item.position.z) + 300,
            ease: 'Expo.easeInOut'
        })

        TweenMax.to( this.textMat, 1, {
            opacity: 0, 
            ease: 'Expo.easeInOut',
            onComplete: () => {
                this.textMat.visible = false
            }
        })

        TweenMax.to( this.captionTextMat, 2, {
            opacity: 1,
            ease: 'Expo.easeInOut',
            delay: 0.3,
            onStart: () => {
                this.captionTextMat.visible = true
            }
        })

        TweenMax.to( this.linkUnderlineMat, 2, {
            opacity: 0.4,
            ease: 'Expo.easeInOut',
            delay: 0.3,
            onStart: () => {
                this.linkUnderlineMat.visible = true
            }
        })

        if( item.caption ) {

            TweenMax.fromTo( item.caption.position, 2, {
                z: -100
            }, {
                z: 0,
                delay: 0.2,
                ease: 'Expo.easeInOut',
                onStart: () => {
                    item.caption.visible = true
                }
            })

        }

        if( item.linkGroup ) {

            TweenMax.fromTo( item.linkGroup.position, 2, {
                z: -100
            }, {
                z: 0,
                delay: 0.3,
                ease: 'Expo.easeInOut',
                onStart: () => {
                    item.linkGroup.visible = true
                }
            })

        }
        
        let pos = new THREE.Vector2()

        for( let x in this.items ) { // TODO: see if can select just in camera range + a bit more for the timeline position

            if( this.items[x].align === 0 ) pos.set( -700, 700 ) // bottom left
            if( this.items[x].align === 1 ) pos.set( 700, 700 ) // bottom right
            if( this.items[x].align === 2 ) pos.set( 700, -700 ) // top right
            if( this.items[x].align === 3 ) pos.set( -700, -700 ) // top left

            if( this.items[x] === item ) continue

            TweenMax.to( this.items[x].material.uniforms.opacity, 1.3, {
                value: 0,
                ease: 'Expo.easeInOut'
            })

            TweenMax.to( this.items[x].position, 1.3, {
                x: pos.x,
                y: pos.y,
                ease: 'Expo.easeInOut'
            })

        }

    }

    closeItem() {

        if( !this.itemAnimating && this.itemOpen ) {

            this.itemAnimating = true
            this.dom.cursor.dataset.cursor = 'pointer'

            if( this.c.isMobile ) {
                let texture = this.itemOpen.mesh.material.uniforms.texture.value
                if( texture.mediaType === 'video' ) {
                    texture.image.pause()
                    texture.image.src = ''
                    texture.image.load()
                }
            }

            TweenMax.to( this.itemOpen.position, 1.5, {
                x: this.itemOpen.origPos.x,
                y: this.itemOpen.origPos.y,
                ease: 'Expo.easeInOut'
            })

            TweenMax.to( this.timeline.position, 1.5, {
                z: this.origTimelinePos,
                ease: 'Expo.easeInOut',
                onComplete: () => {
                    this.c.allowScrolling = true
                    this.itemOpen = false
                    this.itemAnimating = false
                }
            })

            TweenMax.to( this.itemOpen.uniforms.progress, 1.5, {
                value: 0,
                ease: 'Expo.easeInOut'
            })

            TweenMax.to( this.textMat, 1.5, {
                opacity: 1,
                ease: 'Expo.easeInOut',
                onStart: () => {
                    this.textMat.visible = true
                }
            })

            TweenMax.to( [ this.captionTextMat, this.linkUnderlineMat ], 1, {
                opacity: 0, 
                ease: 'Expo.easeInOut',
                onComplete: () => {
                    this.captionTextMat.visible = false
                    this.linkUnderlineMat.visible = false
                    if( this.itemOpen.caption ) this.itemOpen.caption.visible = false
                    if( this.itemOpen.linkGroup ) this.itemOpen.linkGroup.visible = false
                }
            })

            for( let x in this.items ) {

                if( this.items[x].active ) continue

                TweenMax.to( this.items[x].material.uniforms.opacity, 1.5, {
                    value: 1,
                    ease: 'Expo.easeInOut'
                })

                TweenMax.to( this.items[x].position, 1.5, {
                    x: this.items[x].origPos.x,
                    y: this.items[x].origPos.y,
                    ease: 'Expo.easeInOut',
                })

            }

        }
    
    }

    openContact( e ) {

        e.preventDefault()

        if( this.contactSection.isOpen ) return this.closeContact()

        this.dom.cursor.dataset.cursor = 'cross'

        this.contactSection.visible = true
        this.contactSection.isOpen = true
        this.c.allowScrolling = false
        this.linkUnderlineMat.visible = true
        this.linkUnderlineMat.opacity = 0.3

        TweenMax.to( this.camera.position, 2, {
            y: this.contactSection.position.y * this.scene.scale.y,
            ease: 'Expo.easeInOut',
            onComplete: () => {
                this.timeline.visible = false
            }
        })

    }

    closeContact() {

        this.timeline.visible = true
        this.contactSection.isOpen = false

        TweenMax.to( this.camera.position, 2, {
            y: 0,
            ease: 'Expo.easeInOut',
            onComplete: () => {
                this.contactSection.visible = false
                this.c.allowScrolling = true
                this.linkUnderlineMat.visible = false
                this.linkUnderlineMat.opacity = 0
            }
        })

    }

    scroll( e ) {

        let delta = normalizeWheelDelta(e)

        this.c.scrollPos += -delta * 60
        this.c.scrolling = true;        
        
        function normalizeWheelDelta( e ) {
            if(e.detail && e.wheelDelta)
                return e.wheelDelta/e.detail/40 * (e.detail>0 ? 1 : -1) // Opera
            else if( e.deltaY )
                return -e.deltaY / 60 // Firefox
            else
                return e.wheelDelta/120 // IE,Safari,Chrome
        }

    }

    mouseDown( e ) {

        e.preventDefault();

        this.c.holdingMouseDown = true

        if( this.contactSection.isOpen ) {

            if( this.linkIntersect.length > 0 ) {
                if( this.linkIntersect[0].object.onClick )
                this.linkIntersect[0].object.onClick()
            } else {
                this.closeContact()
            }

        } else if( this.itemOpen ) {

            if( this.linkIntersect.length > 0 ) {
                if( this.linkIntersect[0].object.onClick )
                this.linkIntersect[0].object.onClick()
            } else {
                this.closeItem()
            }


        } else {

            if ( this.intersects.length > 0 ) {
                
                this.openItem( this.intersects[0].object.parent )
                this.dom.cursor.dataset.cursor = 'cross'

            } else {

                this.dom.cursor.dataset.cursor = 'move'

                TweenMax.to( this.c, 0.5, {
                    delay: 0.7,
                    autoMoveSpeed: 20
                } )

            }

        }

    }

    mouseUp() {

        if( !this.itemOpen ) this.dom.cursor.dataset.cursor = 'pointer'
        this.c.holdingMouseDown = false
        TweenMax.killTweensOf( this.c, { autoMoveSpeed: true } )
        this.c.autoMoveSpeed = 0

    }

    mouseMove( e ) {

        // raycast for items when in timeline mode
        if( !this.contactSection.isOpen && !this.itemOpen && !this.c.holdingMouseDown ) {

            this.mouse.x = ( e.clientX / this.renderer.domElement.clientWidth ) * 2 - 1
            this.mouse.y = - ( e.clientY / this.renderer.domElement.clientHeight ) * 2 + 1

            this.raycaster.setFromCamera( this.mouse, this.camera )

            this.intersects = this.raycaster.intersectObjects( this.itemMeshes )

            if ( this.intersects.length > 0 ) {
                this.dom.cursor.dataset.cursor = 'eye'
            } else if ( this.dom.cursor.dataset.cursor !== 'pointer' ) {
                this.dom.cursor.dataset.cursor = 'pointer'
            }

        }

        // raycast for item link
        if( !this.contactSection.isOpen && this.itemOpen && this.itemOpen.linkBox ) {

            this.mouse.x = ( e.clientX / this.renderer.domElement.clientWidth ) * 2 - 1
            this.mouse.y = - ( e.clientY / this.renderer.domElement.clientHeight ) * 2 + 1

            this.raycaster.setFromCamera( this.mouse, this.camera )

            this.linkIntersect = this.raycaster.intersectObject( this.itemOpen.linkBox )
            
            if ( this.linkIntersect.length > 0 ) {
                this.dom.cursor.dataset.cursor = 'eye'
            } else if ( this.dom.cursor.dataset.cursor !== 'cross' ) {
                this.dom.cursor.dataset.cursor = 'cross'
            }

        }

        if( this.contactSection.isOpen ) {

            this.mouse.x = ( e.clientX / this.renderer.domElement.clientWidth ) * 2 - 1
            this.mouse.y = - ( e.clientY / this.renderer.domElement.clientHeight ) * 2 + 1

            this.raycaster.setFromCamera( this.mouse, this.camera )

            this.linkIntersect = this.raycaster.intersectObject( this.contactSection.linkBox )
            
            if ( this.linkIntersect.length > 0 ) {
                this.dom.cursor.dataset.cursor = 'eye'
            } else if ( this.dom.cursor.dataset.cursor !== 'cross' ) {
                this.dom.cursor.dataset.cursor = 'cross'
            }

        }

        this.mousePerspective.x = e.clientX / window.innerWidth - 0.5
        this.mousePerspective.y = e.clientY / window.innerHeight - 0.5
        this.updatingPerspective = true

        if( !this.c.touchEnabled ) {
            TweenMax.to( '.cursor', 1.5, {
                x: e.clientX,
                y: e.clientY,
                ease: 'Power4.easeOut'
            })
        }

    }

    updatePerspective() {

        TweenMax.to( this.camera.rotation, 4, {
            x: -this.mousePerspective.y * 0.5,
            y: -this.mousePerspective.x * 0.5,
            ease: 'Power4.easeOut',
        })

        this.updatingPerspective = false

    }

    updateOrientation( e ) {

        if( !this.initialOrientation ) {
            this.initialOrientation = { gamma: e.gamma, beta: e.beta }
        }

        TweenMax.to( this.camera.rotation, 2, {
            x: e.beta ? (e.beta - this.initialOrientation.beta) * (Math.PI / 300) : 0,
            y: e.gamma ? (e.gamma - this.initialOrientation.gamma) * (Math.PI / 300) : 0,
            ease: 'Power4.easeOut',
        })

    }

    changeColours( override = false ) {

        this.remainingMonths = Object.keys( this.monthPositions ).filter( key => {
            return this.timeline.position.z > -this.monthPositions[key] // TODO: look into detecting if exists in camera
        } )

        if( override || ( this.remainingMonths[ this.remainingMonths.length - 1 ] && this.activeMonth !== this.remainingMonths[ this.remainingMonths.length - 1 ] ) ) {

            if( override ) {
                this.activeMonth = override
            } else {
                this.activeMonth = this.remainingMonths[ this.remainingMonths.length - 1 ]
            }

            let bgColor = new THREE.Color( this.months[ this.activeMonth ].bgColor )
            let textColor = new THREE.Color( this.months[ this.activeMonth ].textColor )
            let tintColor = new THREE.Color( this.months[ this.activeMonth ].tintColor )
            let interfaceColor

            TweenMax.to( this.scene.fog.color, 1, {
                r: bgColor.r,
                g: bgColor.g,
                b: bgColor.b,
                ease: 'Power4.easeOut'
            })

            TweenMax.to( this.scene.background, 1, {
                r: bgColor.r,
                g: bgColor.g,
                b: bgColor.b,
                ease: 'Power4.easeOut'
            })

            TweenMax.to( this.textMat.color, 1, {
                r: textColor.r,
                g: textColor.g,
                b: textColor.b,
                ease: 'Power4.easeOut'
            })

            TweenMax.set( [ this.captionTextMat.color, this.linkUnderlineMat.color ], {
                r: textColor.r,
                g: textColor.g,
                b: textColor.b
            })

            for( let id in this.items ) {

                TweenMax.to( this.items[id].uniforms.gradientColor.value, 1, {
                    r: tintColor.r,
                    g: tintColor.g,
                    b: tintColor.b,
                    ease: 'Power4.easeOut'
                })

            }

            if( this.months[ this.activeMonth ].outlineTextColor ) {

                let outlineTextColor = new THREE.Color( this.months[ this.activeMonth ].outlineTextColor )
                interfaceColor = outlineTextColor

                TweenMax.to( [ this.textOutlineMat.color ], 1, {
                    r: outlineTextColor.r,
                    g: outlineTextColor.g,
                    b: outlineTextColor.b,
                    ease: 'Power4.easeOut'
                })
                
            } else {

                interfaceColor = textColor
    
            }

            if( this.months[ this.activeMonth ].contactColor ) 
                this.contactTextMat.color.set( this.months[ this.activeMonth ].contactColor )
            else
                this.contactTextMat.color.set( 0xFFFFFF )

            TweenMax.to( this.dom.mainSvgs, 1, { fill: `rgb(${interfaceColor.r * 255},${interfaceColor.g * 255},${interfaceColor.b * 255})`, ease: 'Power4.easeOut' } )
            TweenMax.to( this.dom.cursorSvgs, 1, { stroke: `rgb(${interfaceColor.r * 255},${interfaceColor.g * 255},${interfaceColor.b * 255})`, ease: 'Power4.easeOut' } )
            TweenMax.to( '.say-hello .underline', 1, { borderBottomColor: `rgba(${interfaceColor.r * 255},${interfaceColor.g * 255},${interfaceColor.b * 255}, 0.3)`, ease: 'Power4.easeOut' } )

        }

    }

    handleVideos() {

        this.camera.updateMatrixWorld();
        this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );
        this.cameraViewProjectionMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
        this.frustum.setFromMatrix( this.cameraViewProjectionMatrix );

        for( let i = 0; i < this.videoCount; i++ ) {

            if( this.frustum.intersectsObject( this.videoItems[ i ] ) && this.videoItems[ i ].material.uniforms.texture.value.image.paused ) {
                this.videoItems[ i ].material.uniforms.texture.value.image.play()
                continue
            }
            
            if ( !this.frustum.intersectsObject( this.videoItems[ i ] ) && !this.videoItems[ i ].material.uniforms.texture.value.image.paused ) {
                this.videoItems[ i ].material.uniforms.texture.value.image.pause()
            }

        }

    }

    animate() {

        this.animationId = requestAnimationFrame( this.animate.bind(this) )

        if( !this.c.touchEnabled && this.updatingPerspective ) {
            this.updatePerspective()
            this.updatingPerspective = false
        }

        if( this.c.autoMoveSpeed > 0 ) {
            this.c.scrolling = true
            this.c.scrollPos += this.c.autoMoveSpeed
        }

        // smooth scrolling
        if( this.c.allowScrolling && this.c.scrolling ) {

            if( this.c.scrollPos <= 0 ) this.c.scrollPos = 0
            if( this.c.scrollPos >= -this.stopScrollPos ) this.c.scrollPos = -this.stopScrollPos

            let delta = ( this.c.scrollPos - this.timeline.position.z ) / 12
            this.timeline.position.z += delta

            if( !this.c.isMobile && Math.abs( delta ) < 10 ) this.handleVideos()
            this.changeColours()

            if( this.timeline.position.z < 700 ) {
                TweenMax.set( this.sections['intro'].circle.rotation, {
                    z: '+=' + delta * 0.005
                })
            }

            if( Math.abs( delta ) > 0.1 ) {
                this.c.scrolling = true
            } else {
                this.c.scrolling = false
            }

        }

        if( this.controls ) this.controls.update()

        this.renderer.render(this.scene, this.camera)

    }

    resize() {

        this.c.size = {
            w: window.innerWidth,
            h: window.innerHeight
        }
        this.camera.fov = 180 * ( 2 * Math.atan( this.c.size.h / 2 / this.camera.position.z ) ) / Math.PI
        this.camera.aspect = this.c.size.w / this.c.size.h
        this.camera.updateProjectionMatrix()
        this.renderer.setSize( this.c.size.w, this.c.size.h )

    }

    initListeners() {

        this.resize = this.resize.bind( this )
        this.mouseMove = this.mouseMove.bind( this )
        this.scroll = this.scroll.bind( this )
        this.mouseDown = this.mouseDown.bind( this )
        this.mouseUp = this.mouseUp.bind( this )
        this.openContact = this.openContact.bind( this )
        this.moveToStart = this.moveToStart.bind( this )

        this.renderer.domElement.addEventListener( 'resize', this.resize, false )
        window.addEventListener( 'mousemove', this.mouseMove, false )
        this.renderer.domElement.addEventListener( 'mousedown', this.mouseDown, false )
        this.renderer.domElement.addEventListener( 'mouseup', this.mouseUp, false )
        this.renderer.domElement.addEventListener( 'wheel', this.scroll, false )

        if( this.gyroEnabled ) {
            this.updateOrientation = this.updateOrientation.bind( this )
            window.addEventListener( 'deviceorientation', this.updateOrientation )
        }

        document.querySelector( '.say-hello' ).addEventListener( 'click', this.openContact, false )
        if( this.enableLoader ) document.querySelector( '.enter' ).addEventListener( 'click', this.moveToStart, false )

        this.gesture = new TinyGesture( this.renderer.domElement, { mouseSupport: false } )

        this.gesture.on( 'panmove', e => {

            this.c.scrollPos += -this.gesture.velocityY * 6
            this.c.scrolling = true;

        })

        this.gesture.on( 'panend', e => this.c.autoMoveSpeed = 0 )
        this.gesture.on( 'longpress', e => this.c.autoMoveSpeed = 10 )

        if( !this.c.touchEnabled ) {
            this.dom.cursor.dataset.cursor = 'pointer'
        }

    }

    preventPullToRefresh() {
        var prevent = false;
    
        this.renderer.domElement.addEventListener('touchstart', function(e){
          if (e.touches.length !== 1) { return; }
    
          var scrollY = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
          prevent = (scrollY === 0);
        });
    
        this.renderer.domElement.addEventListener('touchmove', function(e){
          if (prevent) {
            prevent = false;
            e.preventDefault();
          }
        });
    }

}