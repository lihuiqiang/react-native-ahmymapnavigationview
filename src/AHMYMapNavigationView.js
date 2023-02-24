import React, {Component} from 'react';
import {AHRNCommonTool, Platform, Text, TouchableOpacity, View, AHRNOuterMapModule, Linking} from 'autohome-lib';

export class AHMYMapNavigationView extends Component {
    static defaultProps = {
        noMapTip: undefined, //无安装地图事件回调
    }

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            mapList: []
        }
    }

    componentDidMount() {
        AHRNOuterMapModule.getMapList((mapList) => {
            if (!mapList || mapList.length === 0) {
                return;
            }
            this.setState({
                mapList: mapList
            })
        })
    }

    showMap(lat, lon, address = '终点') {
        this.lat = lat;
        this.lon = lon;
        this.address = address;
        if (this.state.mapList && this.state.mapList.length === 0) {
            this.setState({
                isShow: true
            })
        } else {
            AHRNOuterMapModule.getMapList((mapList) => {
                if (!mapList || mapList.length === 0) {
                    this.props.noMapTip && this.props.noMapTip();
                    return;
                }
                this.setState({
                    mapList: mapList,
                    isShow: true
                })
            })
        }

    }

    closeMap = () => {
        this.setState({
            isShow: false
        })
    }

    navigationOutMap(key) {
        this.closeMap();
        let location = this.lat + ',' + this.lon;
        if (key === AHRNOuterMapModule.tengxun) {
            AHRNOuterMapModule.callOuterMap(key, location);
        } else {
            Linking.openURL(this.getScheme(key));
        }
    }

    getScheme(key) {
        let gdlatitude = this.lat;
        let gdlongitude = this.lon;
        let destinationName = this.address;
        const mapUrls = {
            ios: {
                [AHRNOuterMapModule.gaode]: `iosamap://path?sourceApplication=pingan&dlat=${gdlatitude}&dlon=${gdlongitude}&dname=${destinationName}&dev=0&t=0`,
                [AHRNOuterMapModule.baidu]: `baidumap://map/direction?destination=name:${destinationName}|latlng:${gdlatitude},${gdlongitude}&mode=driving&coord_type=gcj02&src=ios.pingan.autohome`,
                [AHRNOuterMapModule.mkmap]: `http://maps.apple.com/?ll=${gdlatitude},${gdlongitude}&q=${destinationName}&dirflg=drive`
            },
            android: {
                [AHRNOuterMapModule.gaode]: `androidamap://route?sourceApplication=pingan&dlat=${gdlatitude}&dlon=${gdlongitude}&dname=${destinationName}&dev=0&m=0&t=2`,
                [AHRNOuterMapModule.baidu]: `baidumap://map/direction?destination=name:${destinationName}|latlng:${gdlatitude},${gdlongitude}&mode=driving&coord_type=gcj02&src=andr.pingan.autohome`
            }
        }

        if (Platform.OS === 'ios') {
            return mapUrls.ios[key]
        } else if (Platform.OS === 'android') {
            return mapUrls.android[key]
        }
    }

    getNavigationKey(key) {
        if (key.includes('GAODE')) {
            return AHRNOuterMapModule.gaode;
        } else if (key.includes('BAIDU')) {
            return AHRNOuterMapModule.baidu;
        } else if (key.includes('TENGXUN')) {
            return AHRNOuterMapModule.tengxun;
        } else {
            return AHRNOuterMapModule.mkmap;
        }
    }

    //获取对应名称
    getNavigationName(key) {
        if (key.includes('GAODE')) {
            return '高德地图';
        } else if (key.includes('BAIDU')) {
            return '百度地图';
        } else if (key.includes('TENGXUN')) {
            return '腾讯地图';
        } else {
            return '苹果地图'
        }
    }

    //获取底部安全区域
    getBottomSafeArea = () => {
        let bottomSafeArea = 0;
        if (AHRNCommonTool && Object.keys(AHRNCommonTool).length > 0) {
            if (AHRNCommonTool.safeArea()) {
                bottomSafeArea = AHRNCommonTool.safeArea().bottom;
            }
        }
        return bottomSafeArea;
    };

    getTextAdapterStyle() {
        if (Platform.OS == 'android') {
            return {
                fontFamily: 'normal',
            }
        }
        return {};
    }

    renderMapList() {
        return this.state.mapList.map((item, index) => {
            return (
                <TouchableOpacity
                    key={index}
                    style={{width: '100%', height: 50, alignItems: 'center', justifyContent: 'center'}}
                    activeOpacity={1}
                    onPress={() => {
                        this.navigationOutMap(this.getNavigationKey(item))
                    }}
                >
                    <Text style={{color: '#111e36', fontSize: 16, fontWeight: '400', ...this.getTextAdapterStyle()}}>
                        {this.getNavigationName(item)}
                    </Text>
                </TouchableOpacity>
            )
        })
    }

    render() {
        if (!this.state.isShow) {
            return null
        }
        return (
            <View style={{
                flex: 1,
                width: '100%',
                height: '100%',
                position: 'absolute',
                flexDirection: 'column',
                justifyContent: 'flex-end'
            }}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        height: '100%',
                        width: '100%',
                        position: 'absolute'
                    }}
                    onPress={this.closeMap}
                />
                <View style={{
                    flexDirection: 'column',
                    backgroundColor: '#fff',
                    width: '100%',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    paddingBottom: this.getBottomSafeArea()
                }}>
                    {this.renderMapList()}
                    <View style={{width: '100%', height: 4, backgroundColor: '#f8f9fc'}}/>
                    <TouchableOpacity
                        style={{width: '100%', height: 50, alignItems: 'center', justifyContent: 'center'}}
                        activeOpacity={1}
                        onPress={this.closeMap}
                    >
                        <Text style={{color: '#111e36', fontSize: 16, fontWeight: '400', ...this.getTextAdapterStyle()}}>
                            取消
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}