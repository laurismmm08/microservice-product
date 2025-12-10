import Presenter from "./Presenter";

export default class JsonPresenter implements Presenter {
    present(data: any): any {
        return data;
    }
}
