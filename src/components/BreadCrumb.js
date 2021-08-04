import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Breadcrumb } from "antd";
import i18next from 'i18next';
import { EyeOutlined } from '@ant-design/icons';

function i18name(name) {
    switch (name) {
        case 'general':
            return 'panel.general';
        case 'stop':
        case 'ready':
        case 'run':
        case 'alarm':
            return 'tags.mode.' + name;
        case 'run1':
            return 'panel.left';
        case 'run2':
            return 'panel.right';
        default:
            return 'menu.' + name;
    }
}

const BreadCrumb = () => {
    const location = useLocation();
    const breadCrumbView = () => {
        const { pathname } = location;
        const pathnames = pathname.split("/").filter((item) => item);
        return (
            <div>
                <Breadcrumb separator=">" style={{ margin: '3px 0' }}>
                    {pathnames.length > 0 ? (
                        <Breadcrumb.Item key="overview">
                            <Link to="/"><EyeOutlined /></Link>
                        </Breadcrumb.Item>
                    ) : (
                        <Breadcrumb.Item key="overview"><EyeOutlined /> {i18next.t('menu.overview')}</Breadcrumb.Item>
                    )}
                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;
                        return isLast ? (
                            <Breadcrumb.Item key={name}>{i18next.t(i18name(name))}</Breadcrumb.Item>
                        ) : (
                            <Breadcrumb.Item key={name}>
                                <Link to={`${routeTo}`}>{i18next.t(i18name(name))}</Link>
                            </Breadcrumb.Item>
                        );
                    })}
                </Breadcrumb>
            </div>
        );
    };

    return <>{breadCrumbView()}</>;
};

export default BreadCrumb;