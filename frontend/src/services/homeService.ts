
import api from './api';
import type { AxiosResponse } from 'axios';

export interface Button {
    label: string;
    href: string;
}

export interface CTA {
    label: string;
    href: string;
}

export interface HeroData {
    title: string;
    subtitle: string;
    imageUrl: string;
    buttons: Button[];
}

export interface AboutData {
    heading: string;
    description: string;
    imageUrl: string;
    cta: CTA;
}

export interface ProductItem {
    name: string;
    description: string;
    imageUrl: string;
    cta?: CTA; // Optional if not always present
}

export interface ProductData {
    heading: string;
    subheading: string;
    items: ProductItem[];
    cta: CTA;
}

export interface OurStoryData {
    quote: string;
    cta: CTA;
}

export interface AboutUsIntroData {
    title: string;
    paragraphs: string[];
    images: string[];
}

export interface OwnerData {
    heading: string;
    name: string;
    role: string;
    photo: string;
    story: string[];
}

export interface CultureData {
    title: string;
    image: string;
    paragraphs: string[];
}

export interface FunFactData {
    kicker: string;
    text: string;
}


export interface LocationItem {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    type: 'branch' | 'competitor' | 'landmark';
    phone?: string;
    hours?: string;
}

export interface LocationsData {
    branches: LocationItem[];
    competitors: LocationItem[];
    landmarks: LocationItem[];
}

export interface HomeContent {
    hero: HeroData;
    about: AboutData;
    products: ProductData;
    ourstory: OurStoryData;
    about_us_intro: AboutUsIntroData;
    owner: OwnerData;
    culture: CultureData;
    funfact: FunFactData;
    locations: LocationsData;
}

export interface HomeContentResponse {
    success: boolean;
    data: HomeContent;
}

export const getHomeContent = (): Promise<AxiosResponse<HomeContentResponse>> => {
    return api.get<HomeContentResponse>('/home');
};
