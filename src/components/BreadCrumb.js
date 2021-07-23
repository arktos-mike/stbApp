import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Breadcrumb } from "antd";
import i18next from 'i18next';
import { EyeOutlined } from '@ant-design/icons';

const BreadCrumb = () => {
    const location = useLocation();
    const breadCrumbView = () => {
        const { pathname } = location;
        const pathnames = pathname.split("/").filter((item) => item);
        return (
            <div>
                <Breadcrumb separator=">" style={{ margin: '3px 0' }}>
                    {pathnames.length > 0 ? (
                        <Breadcrumb.Item>
                            <Link to="/"><EyeOutlined /></Link>
                        </Breadcrumb.Item>
                    ) : (
                        <Breadcrumb.Item><EyeOutlined /> {i18next.t('menu.overview')}</Breadcrumb.Item>
                    )}
                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                        const isLast = index === pathnames.length - 1;
                        return isLast ? (
                            <Breadcrumb.Item>{i18next.t('menu.'+ name)}</Breadcrumb.Item>
                        ) : (
                            <Breadcrumb.Item>
                                <Link to={`${routeTo}`}>{i18next.t('menu.'+ name)}</Link>
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